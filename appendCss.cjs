const fs = require('fs');
let css = fs.readFileSync('src/style.css', 'utf-8');

// The original .slide-7 and .slide-8 are there.
// We'll append the new slides at the bottom. The cascade will override any previous .slide-8.
css += `
/* ============================================
   NEW SLIDE 8: LOE MATH
   ============================================ */
.slide-8-bg {
  background-image: url('/images/pump-jacks.jpg') !important;
  background-position: center bottom !important;
  filter: brightness(0.2) sepia(0.4) saturate(1.5) !important;
}
.slide-8-content {
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* ============================================
   NEW SLIDE 9: FOUNDER STORY
   ============================================ */
.slide-9-bg {
  /* Using any drone/camera image as background */
  background-image: url('/images/storm-pump.jpg');
  background-position: center;
  filter: grayscale(1) brightness(0.25);
}
.slide-9-content {
  align-items: center;
  justify-content: center;
}

/* ============================================
   SLIDE 10 (formerly Slide 8): THE RAISE
   ============================================ */
.slide-10-bg {
  background-image: url('/images/diagram-ui.jpg');
  background-position: center;
}
.slide-10 .slide-overlay {
  background: rgba(10, 10, 10, 0.90);
}
.slide-10-content {
  justify-content: center;
}
`;

fs.writeFileSync('src/style.css', css);
console.log("Appended new CSS.");
