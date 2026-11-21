/** Video format sizes. Run: node --test scripts/test/format.test.mjs */
import test from "node:test";
import assert from "node:assert/strict";
import { formatOf } from "../lib/format.mjs";

test("defaults to 16:9", () => assert.deepEqual(formatOf({}), { name: "16:9", width: 1920, height: 1080, slug: "16-9" }));
test("4:5 is 1080x1350", () => assert.deepEqual(formatOf({ meta: { aspect: "4:5" } }), { name: "4:5", width: 1080, height: 1350, slug: "4-5" }));
test("9:16 is 1080x1920", () => assert.equal(formatOf({ meta: { aspect: "9:16" } }).height, 1920));
test("rejects unknown formats", () => assert.throws(() => formatOf({ meta: { aspect: "1:1" } }), /Use 16:9, 4:5 or 9:16/));
test("ignores meta.format deliverable values", () => assert.equal(formatOf({ meta: { format: "all" } }).name, "16:9"));
