import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--allow-file-access-from-files'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1998, height: 1230, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(`${process.cwd()}/brand-pages.html`).href, {
    waitUntil: 'networkidle0',
  });

  async function measureRows() {
    return page.$$eval('.marquee-row', (elements) =>
      elements.map((row) => {
        const track = row.querySelector('.marquee-row__track');
        return {
          rowWidth: row.clientWidth,
          trackWidth: track.scrollWidth,
          sequenceWidths: Array.from(track.querySelectorAll('.marquee-sequence'), (sequence) => sequence.scrollWidth),
        };
      }),
    );
  }

  function assertRows(rows) {
    rows.forEach(({ rowWidth, trackWidth, sequenceWidths }, index) => {
      assert.equal(sequenceWidths.length, 2, `Marquee row ${index + 1} must contain two animation sequences`);
      assert.equal(sequenceWidths[0], sequenceWidths[1], `Marquee row ${index + 1} sequences must be equal widths`);
      assert.ok(
        sequenceWidths[0] >= rowWidth,
        `Marquee row ${index + 1} sequence is ${sequenceWidths[0]}px wide; it needs at least ${rowWidth}px`,
      );
      assert.ok(
        trackWidth >= rowWidth * 2,
        `Marquee row ${index + 1} is ${trackWidth}px wide; it needs at least ${rowWidth * 2}px for a seamless loop`,
      );
    });
  }

  assertRows(await measureRows());

  await page.setViewport({ width: 2560, height: 1230, deviceScaleFactor: 1 });
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assertRows(await measureRows());

  console.log('Client marquee fills both seamless animation cycles.');
} finally {
  await browser.close();
}
