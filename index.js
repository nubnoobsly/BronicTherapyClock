const display = document.getElementById("clock");
const audio = new Audio(
  "https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3"
);
audio.loop = true;
const timeToBeSet = "";
const sunshineAudio = new Audio("sunshin.mp3"); // Add the sunshine audio
sunshineAudio.loop = false; // Play it only once

let alarmTime = "00:00"; // Default alarm time (HH:mm format)
let snoozeTime = null; // Separate variable for snoozed time
let originalAlarmTime = null; // Store the original alarm time

let currentSnoozeAudio = null; // Variable to track the currently playing snooze audio
let isAlarmPlaying = false; // Track if the alarm is currently going off
let alarmResetCooldown = false; // Flag to prevent alarm triggering after reset

let incrementMinutes = 1; // Default increment value is 1 minute

// Create an image element for lebron.jpg
const lebronImage = document.createElement("img");
lebronImage.src = "lebron.jpg";
lebronImage.id = "lebron-image";
lebronImage.style.position = "absolute";
lebronImage.style.top = "0";
lebronImage.style.left = "0";
lebronImage.style.width = "100%";
lebronImage.style.height = "100%";
lebronImage.style.objectFit = "cover"; // Ensures the image scales proportionally to cover the window
lebronImage.style.opacity = "0";
lebronImage.style.transition = "opacity 1s ease-in-out";
lebronImage.style.zIndex = "1"; // Places the image in front of the background but behind other elements
lebronImage.style.pointerEvents = "none"; // Makes the image non-interactive
document.body.appendChild(lebronImage);

// Array of snooze audio file paths
const snoozeAudioFiles = [
  "SnoozeAudio/1.mp3",
  "SnoozeAudio/2.mp3",
  "SnoozeAudio/3.mp3",
];

// Function to play a random snooze audio or a specific one on Tuesday
function playRandomSnoozeAudio() {
  const today = new Date().getDay(); // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)

  if (today === 2) {
    // Check if it's Tuesday (2 = Tuesday)
    const tuesdayAudio = "SnoozeAudio/Tuesday.mp3";
    console.log("It's Tuesday! Playing:", tuesdayAudio);
    currentSnoozeAudio = new Audio(tuesdayAudio); // Play the specific Tuesday audio
  } else {
    if (currentSnoozeAudio && !currentSnoozeAudio.paused) {
      console.log("A snooze audio is already playing. Skipping new audio.");
      return; // Prevent playing another audio if one is already playing
    }

    const randomIndex = Math.floor(Math.random() * snoozeAudioFiles.length); // Get a random index
    const filePath = snoozeAudioFiles[randomIndex]; // Select a random file from the array
    console.log(`Selected file: ${filePath}`);
    currentSnoozeAudio = new Audio(filePath); // Create a new Audio object
  }

  currentSnoozeAudio.play(); // Play the selected audio

  currentSnoozeAudio.addEventListener("ended", () => {
    currentSnoozeAudio = null; // Reset when the audio finishes
  });
}

function updateTime() {
  const date = new Date();

  const hour = formatTime(date.getHours());
  const minutes = formatTime(date.getMinutes());
  const seconds = formatTime(date.getSeconds());

  display.innerText = `${hour} : ${minutes} : ${seconds}`;

  // Check if the current time matches the snooze time or the base alarm time
  if (
    !alarmResetCooldown &&
    `${hour}:${minutes}` === (snoozeTime || alarmTime)
  ) {
    triggerAlarm();
  }
}

function formatTime(time) {
  return time < 10 ? "0" + time : time;
}

// Function to trigger the alarm
function triggerAlarm() {
  if (!audio.paused || isAlarmPlaying) return; // Prevent retriggering if already playing
  isAlarmPlaying = true; // Set the alarm as playing
  audio.play();
  fadeInLebronImage();

  // Stop the alarm after the duration of sunshin.mp3
  setTimeout(() => {
    clearAlarm(); // Automatically stop the alarm
    isAlarmPlaying = false; // Reset the alarm state
  }, sunshineAudio.duration * 1000); // Convert duration to milliseconds
}

// Function to clear the alarm
function clearAlarm() {
  audio.pause();
  sunshineAudio.pause(); // Stop the sunshine audio if it's playing
  sunshineAudio.currentTime = 0; // Reset the sunshine audio
  fadeOutLebronImage();
  isAlarmPlaying = false; // Reset the alarm state
}

function fadeInLebronImage() {
  lebronImage.style.opacity = "1";
  sunshineAudio.play(); // Play the sunshine audio when the image fades in
}

function fadeOutLebronImage() {
  lebronImage.style.opacity = "0";
}

// Adjust alarm time with arrow keys
document.addEventListener("keydown", (event) => {
  const [hour, minute] = alarmTime.split(":").map(Number);

  if (event.code === "ArrowUp") {
    // Increase the alarm time by the current increment value
    const newMinute = (minute + incrementMinutes) % 60;
    const newHour = (hour + Math.floor((minute + incrementMinutes) / 60)) % 24;
    alarmTime = `${formatTime(newHour)}:${formatTime(newMinute)}`;
    snoozeTime = null; // Reset snooze time when the base alarm time is updated

    // Update the UI alarm time
    const alarmInput = document.getElementById("alarm-time-input");
    if (alarmInput) {
      alarmInput.value = alarmTime; // Update the input field with the new alarm time
    }
  } else if (event.code === "ArrowDown") {
    // Decrease the alarm time by the current increment value
    const newMinute = (minute - incrementMinutes + 60) % 60;
    const newHour = (hour - (minute < incrementMinutes ? 1 : 0) + 24) % 24;
    alarmTime = `${formatTime(newHour)}:${formatTime(newMinute)}`;
    snoozeTime = null; // Reset snooze time when the base alarm time is updated

    // Update the UI alarm time
    const alarmInput = document.getElementById("alarm-time-input");
    if (alarmInput) {
      alarmInput.value = alarmTime; // Update the input field with the new alarm time
    }
  } else if (event.code === "KeyJ") {
    // Toggle the increment value between 1 and 5 minutes
    incrementMinutes = incrementMinutes === 1 ? 5 : 1;
    console.log(`Increment value changed to: ${incrementMinutes} minute(s)`);
  } else if (event.code === "Space") {
    snoozeAlarm(); // Snooze the alarm when the space bar is pressed
  } else if (event.code === "KeyK") {
    clearAlarmUntilNext(); // Reset the alarm time to the base time
  } else if (event.code === "Enter") {
    const newHour = (hour + 12) % 24; // Add 12 hours to switch between AM and PM
    alarmTime = `${formatTime(newHour)}:${formatTime(minute)}`;
    snoozeTime = null; // Reset snooze time when the base alarm time is updated

    // Update the UI alarm time
    const alarmInput = document.getElementById("alarm-time-input");
    if (alarmInput) {
      alarmInput.value = alarmTime; // Update the input field with the new alarm time
    }

    console.log(`Alarm time toggled to: ${alarmTime}`);
  }

  console.log(`Alarm time set to: ${alarmTime}`); // Log the updated alarm time
});

// Add an event listener to detect changes in the alarm time input
const alarmInput = document.getElementById("alarm-time-input"); // Assuming the input field has this ID
if (alarmInput) {
  alarmInput.addEventListener("input", (event) => {
    const value = event.target.value; // Get the new value from the input
    if (value) {
      setAlarmTime(value); // Automatically set the new alarm time
    }
  });
}

// Function to snooze the alarm
function snoozeAlarm() {
  if (!isAlarmPlaying) {
    console.log("Cannot snooze. The alarm is not currently going off.");
    return; // Only allow snoozing if the alarm is playing
  }

  clearAlarm(); // Stop the current alarm
  const [hour, minute] = (snoozeTime || alarmTime).split(":").map(Number); // Use snoozeTime if it exists, otherwise use alarmTime
  const newMinute = (minute + 5) % 60; // Add 5 minutes for snooze
  const newHour = (hour + Math.floor((minute + 5) / 60)) % 24;
  snoozeTime = `${formatTime(newHour)}:${formatTime(newMinute)}`;
  console.log(`Alarm snoozed to: ${snoozeTime}`);

  // Play a random snooze audio
  playRandomSnoozeAudio();
}

// Function to clear the alarm and snooze audio
function clearAlarmUntilNext() {
  snoozeTime = null; // Clear the snooze time
  console.log(`Alarm reset to base time: ${alarmTime}`);

  let timeToBeSet = alarmTime; // Use 'let' for reassignment
  const snapshotAlarmTime = alarmTime; // Take a snapshot of the current alarm time

  // const newMinute = (minute - 2 + 60) % 60;
  // const newHour = (hour - (minute < 2 ? 1 : 0) + 24) % 24;
  // const newAlarmTime = `${formatTime(newHour)}:${formatTime(newMinute)}`;
  setAlarmTime("00:00"); // Set the alarm time to 00:00

  setTimeout(() => {
    if (alarmTime === timeToBeSet) {
      console.log("Alarm time is back to base time.");
    } else {
      console.log("Alarm time is different from the base time.");
      setAlarmTime(timeToBeSet);
    }
  }, 61000);

  clearAlarm(); // Stop the current alarm

  // Stop the currently playing snooze audio
  if (currentSnoozeAudio) {
    currentSnoozeAudio.pause();
    currentSnoozeAudio.currentTime = 0; // Reset the audio to the beginning
    currentSnoozeAudio = null; // Clear the reference to the audio
    console.log("Snooze audio stopped.");
  }
}

function setAlarmTime(value) {
  // Assume the input value is already in HH:mm format
  if (value) {
    alarmTime = value; // Set the alarm time in HH:mm format
    snoozeTime = null; // Reset snooze time whenever the base alarm time is updated
    console.log(`Alarm time set to: ${alarmTime}`);
  }
}

setInterval(updateTime, 1000);
