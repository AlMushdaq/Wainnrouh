#!/usr/bin/env python3
"""
Google Maps Place Scraper using Playwright.
"""

import sys
import json
import argparse
import math
from playwright.sync_api import sync_playwright


def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def scrape_google_maps(query, city, user_lat=None, user_lng=None, max_results=10, sort_mode='distance'):
    if sort_mode == 'stars':
        search_term = f"best {query} in {city}"
        url = f"https://www.google.com/maps/search/{search_term.replace(' ', '+')}"
    elif user_lat and user_lng:
        url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}/@{user_lat},{user_lng},14z"
    else:
        search_term = f"{query} in {city}"
        url = f"https://www.google.com/maps/search/{search_term.replace(' ', '+')}"

    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            locale="en-US",
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            geolocation={"latitude": user_lat, "longitude": user_lng} if user_lat and user_lng else None,
            permissions=["geolocation"] if user_lat and user_lng else [],
        )
        page = context.new_page()

        try:
            page.goto(url, wait_until="domcontentloaded", timeout=20000)
            page.wait_for_timeout(3000)

            # Consent dismiss
            try:
                page.locator('button:has-text("Accept all")').first.click(timeout=1500)
                page.wait_for_timeout(800)
            except:
                pass

            # Wait for feed
            try:
                page.wait_for_selector('div[role="feed"]', timeout=8000)
            except:
                page.wait_for_timeout(1500)

            # Scroll to load results
            feed = page.locator('div[role="feed"]').first
            for _ in range(3):
                try:
                    feed.evaluate('el => el.scrollTop = el.scrollHeight')
                    page.wait_for_timeout(1000)
                except:
                    break

            # Extract places
            place_links = page.locator('div[role="feed"] > div > div > a[href*="/maps/place/"]').all()

            for link in place_links[:max_results * 2]:
                if len(results) >= max_results:
                    break

                try:
                    aria_label = link.get_attribute("aria-label") or ""
                    href = link.get_attribute("href") or ""
                    if not aria_label:
                        continue

                    name = aria_label.strip()
                    if any(r["name"] == name for r in results):
                        continue

                    lat, lng = None, None
                    if "!3d" in href and "!4d" in href:
                        try:
                            lat = float(href.split("!3d")[1].split("!")[0])
                            lng = float(href.split("!4d")[1].split("!")[0])
                        except:
                            pass

                    parent = link.locator("..").first
                    rating = None
                    reviews = None
                    address = ""

                    try:
                        lines = [l.strip() for l in parent.inner_text(timeout=1500).split("\n") if l.strip()]
                        for line in lines:
                            if rating is None and len(line) <= 4:
                                try:
                                    val = float(line)
                                    if 1.0 <= val <= 5.0:
                                        rating = val
                                except:
                                    pass
                            if "(" in line and ")" in line and rating is not None and reviews is None:
                                try:
                                    reviews = int(line.strip("()").replace(",", "").replace(".", ""))
                                except:
                                    pass
                            if not address and ("·" in line or "," in line) and len(line) > 10:
                                address = line.split("·")[-1].strip() if "·" in line else line
                    except:
                        pass

                    if sort_mode == 'stars' and rating is None:
                        continue

                    distance_km = None
                    if lat and lng and user_lat and user_lng:
                        distance_km = round(haversine_km(user_lat, user_lng, lat, lng), 1)

                    results.append({
                        "name": name,
                        "address": address or city,
                        "rating": rating,
                        "reviews": reviews,
                        "lat": lat,
                        "lng": lng,
                        "distanceKm": distance_km,
                    })
                except:
                    continue

        except Exception as e:
            print(json.dumps({"error": str(e)}), file=sys.stderr)
        finally:
            browser.close()

    return results


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("query")
    parser.add_argument("city")
    parser.add_argument("--lat", type=float, default=None)
    parser.add_argument("--lng", type=float, default=None)
    parser.add_argument("--max", type=int, default=10)
    parser.add_argument("--sort", default="distance", choices=["distance", "stars"])
    args = parser.parse_args()

    places = scrape_google_maps(args.query, args.city, args.lat, args.lng, args.max, args.sort)
    print(json.dumps({"suggestions": places}, ensure_ascii=False))


if __name__ == "__main__":
    main()
