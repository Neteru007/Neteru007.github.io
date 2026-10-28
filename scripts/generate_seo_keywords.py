#!/usr/bin/env python3
"""Generate editorial keyword candidates; not real search-volume measurements."""
import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = {
    "таро": ["розклад таро", "таро онлайн", "таро на кохання", "таро на стосунки", "таро на роботу", "таро на майбутнє", "таро так чи ні"],
    "магія": ["відьма", "маг", "магія", "ритуальна магія", "демонолог", "шаманізм"],
    "руни": ["ворожіння на рунах", "руна дня", "руни онлайн"],
}
MODIFIERS = ["", "українською", "онлайн", "Україна", "Київ", "ціна", "консультація"]
OUT = ROOT / "seo" / "keyword-candidates.csv"
OUT.parent.mkdir(parents=True, exist_ok=True)
with OUT.open("w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["keyword", "topic", "source", "search_volume", "status"])
    seen = set()
    for topic, phrases in BASE.items():
        for phrase in phrases:
            for suffix in MODIFIERS:
                keyword = " ".join(x for x in [phrase, suffix] if x)
                if keyword in seen:
                    continue
                seen.add(keyword)
                writer.writerow([keyword, topic, "generated_candidate", "", "review_required"])
print(f"Created {OUT} with {len(seen)} candidate phrases; no live demand metrics.")
