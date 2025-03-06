let capture;
let isPhotoBoothOpen = false;
let snapButton;
let retakeButton;
let saveButton;
let photoCanvas;
let timer = 0;
let countdownActive = false;
let photoTaken = false;
let selectedFilter = "none"; 
let filterButtons = []; 
let landingButton;
let welcomeButton;
let currentScreen = "landing"; 
let previousScreen = null; 
let backButton;

function setup() {
  createCanvas(640, 480);
  currentScreen = "landing"; 

  // Initialize the video feed and start it immediately
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide(); // Hide the video feed by default
}

function landingPage() {
  background("#ffe6f2");
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Booth by Xime :)", width / 2, height / 3);
  
  fill(0);
  textSize(21);
  textAlign(CENTER, CENTER);
  text("Welcome!", width / 2, height / 2.3);
  fill(0);
  textSize(18);
  textAlign(CENTER, CENTER);
  text("This is your personal photobooth at home.", width / 2, height / 2);

  if (!landingButton) {
    landingButton = createButton("START");
    landingButton.addClass("start-button landing-button");
    landingButton.mousePressed(() => {
      previousScreen = "landing"; 
      currentScreen = "welcome";
      landingButton.remove();
      landingButton = null;
    });
  }

  if (backButton) {
    backButton.hide();
  }
}

function welcomePage() {
  background("#ffe6f2");
  fill(0);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("You have 3 seconds for each shot!", width / 2, height / 3.5);
  text("So strike your best pose and have fun!", width / 2, height / 2.5);
  fill(0);
  textSize(18);
  textAlign(CENTER, CENTER);
  text("After the session, download your digital copy", width / 2, height /2);
  text("and share the fun!", width / 2, height /1.8);
  
  if (!welcomeButton) {
    welcomeButton = createButton("START");
    welcomeButton.addClass("start-button welcome-button");
    welcomeButton.mousePressed(() => {
      previousScreen = "welcome"; 
      currentScreen = "photoBooth";
      welcomeButton.remove();
      welcomeButton = null;
      openPhotoBooth();  
    });
  }

  if (!backButton) {
    backButton = createButton("🔙 Back");
    backButton.addClass("back-button");
    backButton.mousePressed(() => {
      goBack();
    });
    backButton.position(20, 20);
  } else {
    backButton.show();
  }
}

function openPhotoBooth() {
  if (isPhotoBoothOpen) return;

  // Ensure capture is always initialized and running
  capture.loop(); // Keeps the video feed running

  let x = (windowWidth - 640) / 2;
  let y = (windowHeight - 480) / 2;
  capture.position(x, y);

  if (!snapButton) {
    snapButton = createButton("📸 Snap a picture!");
    snapButton.addClass("snap-button");
    snapButton.mousePressed(startTimer);
  }
  snapButton.show();

  if (!filterButtons.length) {
    createFilterButtons();
  }

  filterButtons.forEach(btn => btn.show());

  if (!retakeButton) {
    retakeButton = createButton("🔄 Retake Photo");
    retakeButton.addClass("retake-button");
    retakeButton.mousePressed(retakePhoto);
    retakeButton.hide();
  }

  if (!backButton) {
    backButton = createButton("🔙 Back");
    backButton.addClass("back-button");
    backButton.mousePressed(() => {
      goBack();
    });
    backButton.position(20, 20);
  } else {
    backButton.show();
  }

  isPhotoBoothOpen = true; // Set flag that photo booth is now open
}

function closePhotoBooth() {
  if (!isPhotoBoothOpen) return;
  isPhotoBoothOpen = false;

  capture.stop(); // Stop the capture when closing the photo booth

  if (snapButton) {
    snapButton.remove();
    snapButton = null;
  }

  if (saveButton) {
    saveButton.remove();
    saveButton = null;
  }

  filterButtons.forEach(btn => btn.remove());
  filterButtons = [];

  if (backButton) {
    backButton.remove();
    backButton = null;
  }
}

function startTimer() {
  if (!countdownActive) {
    timer = 3;
    countdownActive = true;

    let countdown = setInterval(() => {
      timer--;
      if (timer <= 0) {
        clearInterval(countdown);
        takePhoto();
        countdownActive = false;
      }
    }, 1000);
  }
}

function takePhoto() {
  photoCanvas = createGraphics(640, 480);

  photoCanvas.push();
  photoCanvas.translate(photoCanvas.width, 0);
  photoCanvas.scale(-1, 1);
  photoCanvas.image(capture, 0, 0, 640, 480);
  photoCanvas.pop();

  photoTaken = true;
  snapButton.hide();

  saveButton = createButton("💾 Save Photo");
  saveButton.addClass("save-button");
  saveButton.mousePressed(savePhoto);

  retakeButton.show();
}

function savePhoto() {
  save(photoCanvas, "enjoyyourphoto😄.png");
}

function retakePhoto() {
  resetPhotoBooth();
  saveButton.hide();
  retakeButton.hide();
  snapButton.show();
}

function resetPhotoBooth() {
  photoCanvas = null;
  photoTaken = false;
  retakeButton.hide();

  // Keep the capture running for the next session
  capture.loop(); 

  selectedFilter = "none";
  filterButtons.forEach(btn => btn.removeClass("active"));
}

function createFilterButtons() {
  let labels = ["B&W", "Sepia", "Invert", "Reset"];
  let filters = ["grayscale", "sepia", "invert", "none"];

  filterButtons.forEach(btn => btn.remove());
  filterButtons = [];

  let container = createDiv().addClass("filter-buttons-container");

  labels.forEach((label, i) => {
    let btn = createButton(label);
    btn.addClass("filter-button");
    btn.mousePressed(() => applyFilter(filters[i]));
    filterButtons.push(btn);
    container.child(btn);
  });
}

function applyFilter(filter) {
  selectedFilter = filter;
  filterButtons.forEach((btn, index) => {
    if (index === filterButtons.findIndex(button => button.elt.innerHTML === filter)) {
      btn.addClass("active");
    } else {
      btn.removeClass("active");
    }
  });
}

function goBack() {
  if (currentScreen === "photoBooth") {
    retakeButton.hide();
    previousScreen = "photoBooth";
    currentScreen = "welcome";
    closePhotoBooth();
    resetPhotoBooth();  // Reset the photo booth when going back
    welcomePage();
  } else if (currentScreen === "welcome") {
    previousScreen = "welcome";
    currentScreen = "landing";
    welcomeButton.remove();
    welcomeButton = null;
    landingPage();
  } else if (currentScreen === "landing") {
    previousScreen = "landing";
    currentScreen = "photoBooth";
    closePhotoBooth(); // Close photo booth if it's already open
    resetCapture(); // Reset the capture and re-open the photo booth
    openPhotoBooth();
  }
}

function resetCapture() {
  capture.stop(); // Stop the current capture feed
  capture.play(); // Restart the capture feed
}

function draw() {
  background(0);

  if (currentScreen === "landing") {
    landingPage();
  } else if (currentScreen === "welcome") {
    welcomePage();
  } else if (currentScreen === "photoBooth") {
    photoBooth();
  } else {
    closePhotoBooth();
  }

  if (countdownActive) {
  fill(0, 150);  // Semi-transparent black for the background behind the timer
  noStroke();
  rect(width / 2 - 30, 30, 60, 40, 10);  // Draw a rounded rectangle as the background

  fill(255);  // White text color
  textSize(32);
  textAlign(CENTER, CENTER);
  text(timer, width / 2, 50);
}
}

function photoBooth() {
  background(255);

  if (!filterButtons.length && !photoTaken) {
    createFilterButtons();
  }

  if (isPhotoBoothOpen && capture && !photoTaken) {
    push();
    translate(width, 0);
    scale(-1, 1);

    // Apply the selected filter here, but only in the photo booth page
    if (selectedFilter === "grayscale") {
      capture.loadPixels();
      for (let i = 0; i < capture.pixels.length; i += 4) {
        let r = capture.pixels[i];
        let g = capture.pixels[i + 1];
        let b = capture.pixels[i + 2];
        let avg = (r + g + b) / 3;
        capture.pixels[i] = avg;
        capture.pixels[i + 1] = avg;
        capture.pixels[i + 2] = avg;
      }
      capture.updatePixels();
    } else if (selectedFilter === "sepia") {
      capture.loadPixels();
      for (let i = 0; i < capture.pixels.length; i += 4) {
        let r = capture.pixels[i];
        let g = capture.pixels[i + 1];
        let b = capture.pixels[i + 2];
        capture.pixels[i] = r * 0.393 + g * 0.769 + b * 0.189;
        capture.pixels[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
        capture.pixels[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
      }
      capture.updatePixels();
    } else if (selectedFilter === "invert") {
      capture.loadPixels();
      for (let i = 0; i < capture.pixels.length; i += 4) {
        capture.pixels[i] = 255 - capture.pixels[i];
        capture.pixels[i + 1] = 255 - capture.pixels[i + 1];
        capture.pixels[i + 2] = 255 - capture.pixels[i + 2];
      }
      capture.updatePixels();
    }

    image(capture, 0, 0);
    pop();
  }

  if (photoTaken) {
    image(photoCanvas, 0, 0);
  }
}
