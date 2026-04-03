const fs = require('fs');

try {
  let html = fs.readFileSync('index.html', 'utf8');

  // The new Slide 4 and Slide 5 content to replace the old Slide 4
  const newSlidesHTML = `
  <!-- Slide 4: Production Problem (Context) -->
  <section class="slide slide-4" id="slide-4" data-slide="3">
    <video class="slide-bg-video" autoplay loop muted playsinline poster="/images/pump-jacks.jpg">
      <source src="/videos/siteview.mp4" type="video/mp4" />
    </video>
    <div class="slide-bg slide-4-bg fallback-bg"></div>
    <div class="slide-overlay overlay-gradient-left"></div>
    <div class="slide-content slide-4-content">
      <h2 class="section-title animate-in"><span class="accent">Oil and Gas Production:</span> The Problem</h2>
      <div class="two-col">
        <div class="col-left">
          <div class="problem-card animate-in delay-1">
            <div class="problem-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/></svg>
            </div>
            <div>
              <h3>Manual Inspections</h3>
              <p>Daily manned inspections of oil and gas sites waste time and miss early issues.</p>
            </div>
          </div>
          <div class="problem-card animate-in delay-2">
            <div class="problem-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-2.25h7.5A1.125 1.125 0 0118.75 12v-1.5c0-.621-.504-1.125-1.125-1.125H11.25m0 0L9 6.75H3.375c-.621 0-1.125.504-1.125 1.125v6m9-4.5V6.75"/></svg>
            </div>
            <div>
              <h3 class="stat-highlight">150–250 Miles/Day</h3>
              <p>Lease Operators drive 150–250 miles/day to check sites that are mostly normal.</p>
            </div>
          </div>
        </div>
        <div class="col-right">
          <!-- Empty for now, allowing background video to shine through ->
        </div>
      </div>
      <div class="kpi-bar animate-in delay-3">
        <div class="kpi-icon">📊</div>
        <div class="kpi-content">
          <span class="kpi-label">KEY PERFORMANCE INDICATOR</span>
          <span class="kpi-stat">Typical operator covers <strong>~40 sites/day</strong> = <strong>>$100</strong> in fuel + <strong>~6 hours</strong> labor (per person)</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Slide 5: The Leak Problem -->
  <section class="slide slide-5" id="slide-5" data-slide="4">
    <video class="slide-bg-video" style="object-position: center bottom;" autoplay loop muted playsinline poster="/images/pump-jacks.jpg">
      <source src="/videos/leak.mp4" type="video/mp4" />
    </video>
    <div class="slide-bg slide-5-bg fallback-bg"></div>
    <div class="slide-overlay overlay-gradient-left"></div>
    <div class="slide-content slide-5-content">
      <h2 class="section-title animate-in"><span class="accent">Costly Reality:</span> Undetected Events</h2>
      <div class="two-col">
        <div class="col-left">
           <div class="problem-card animate-in delay-1">
             <div class="problem-icon">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
             </div>
             <div>
               <h3>Environmental & Financial Impact</h3>
               <p>Undetected wellhead pooling and mechanical leaks cause major compliance fines and resource loss before the next manual inspection.</p>
             </div>
           </div>
        </div>
        <div class="col-right">
          <div class="visual-problem-card animate-in delay-2">
            <img src="/images/nasty-wellhead.jpg" alt="Nasty pooling at wellhead" class="problem-image" />
            <div class="problem-image-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <span>Undetected Leak Event</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  // Extract the original old slides 5, 6, 7 and increment them to 6, 7, 8
  const parts = html.split('<!-- Slide 5: Solution Edge Operator -->');
  if(parts.length !== 2) throw new Error("Could not find Slide 5 splitting point");

  const beforePart = parts[0].split('<!-- Slide 4: Production Problem -->')[0];
  let afterPart = '<!-- Slide 6: Solution Edge Operator -->' + parts[1];

  // We need to carefully replace the IDs and Classes from bottom to top so we don't double replace.
  afterPart = afterPart.replace(/Slide 7/g, 'Slide 8');
  afterPart = afterPart.replace(/slide-7/g, 'slide-8');
  afterPart = afterPart.replace(/data-slide="6"/g, 'data-slide="7"');

  afterPart = afterPart.replace(/Slide 6/g, 'Slide 7');
  afterPart = afterPart.replace(/slide-6/g, 'slide-7');
  afterPart = afterPart.replace(/data-slide="5"/g, 'data-slide="6"');

  afterPart = afterPart.replace(/Slide 5/g, 'Slide 6');
  afterPart = afterPart.replace(/slide-5/g, 'slide-6');
  afterPart = afterPart.replace(/data-slide="4"/g, 'data-slide="5"');

  // Reconstruct
  const finalHTML = beforePart + newSlidesHTML + '\n\n  ' + afterPart;
  fs.writeFileSync('index.html', finalHTML, 'utf8');
  console.log("HTML updated successfully.");

  // CSS updates
  let css = fs.readFileSync('src/style.css', 'utf8');
  css = css.replace(/slide-7/g, 'slide-8');
  css = css.replace(/slide-6/g, 'slide-7');
  css = css.replace(/slide-5/g, 'slide-6');

  // add slide-5-bg rule
  const newCSS = `/* ============================================
   SLIDE 5 — The Leak Problem
   ============================================ */
.slide-5-bg {
  background-image: url('/images/pump-jacks.jpg');
  background-position: center bottom;
}
.slide-5-content {
  gap: 1.5rem;
}
`;
  css = css.replace('/* ============================================', newCSS + '\n/* ============================================');
  fs.writeFileSync('src/style.css', css, 'utf8');
  console.log("CSS updated successfully.");

} catch (err) {
  console.error(err);
}
