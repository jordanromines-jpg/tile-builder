/* More projects for 3 to 5 (2.1): silly flat pictures and one wobbly build, one tile a step, from a Magna-Tiles 32.
   Words from the 3–5 list only. */
import type { Project } from "../engine/types";
import { Builder } from "./helpers";

function snail(): Project {
  const b = new Builder();
  b.on("square-large", "orange", [0, 0], [2, 0]);
  b.step("Put a big orange square flat on the table. It is the snail's shell.");
  b.on("square", "yellow", [2, 0], [3, 0]);
  b.step("Put a yellow square next to it. That is the snail's body.");
  b.on("square", "yellow", [3, 0], [4, 0]);
  b.step("One more yellow square next to that. Now it has a head.");
  b.on("tri-right", "green", [3, 1], [4, 1]);
  b.step("Put a small green triangle on top of the head. A feeler!");
  b.on("tri-equilateral", "blue", [0.5, 2], [1.5, 2]);
  b.step("Put a blue triangle on top of the shell. Snails love hats.");
  return b.build({ id: "silly-snail", title: "A silly snail in a hat", theme: "animals", age: "a", stars: 1, flat: true, done: "You made a silly snail! It is very slow, and very fancy." });
}

function shark(): Project {
  const b = new Builder();
  b.on("square", "blue", [0, 0], [1, 0]);
  b.step("Put a blue square flat on the table.");
  b.on("square", "blue", [1, 0], [2, 0]);
  b.step("Put another blue square next to it. This is the shark's body.");
  b.on("tri-equilateral", "purple", [2, 1], [2, 0]);
  b.step("Put a triangle at the end. That is its nose.");
  b.on("tri-equilateral", "purple", [0, 0], [0, 1]);
  b.step("Put a triangle at the other end. That is its tail.");
  b.on("tri-equilateral", "green", [0.5, 1], [1.5, 1]);
  b.step("Put a triangle on top. The fin!");
  b.on("tri-right", "yellow", [2, 0], [1, 0]);
  b.step("A small triangle under the body. The shark is yawning.");
  return b.build({ id: "sleepy-shark", title: "A sleepy shark", theme: "animals", age: "a", stars: 1, flat: true, done: "You made a sleepy shark! Shh. It is having a nap." });
}

function bananaBoat(): Project {
  const b = new Builder();
  b.on("square", "yellow", [0, 0], [1, 0]);
  b.step("Put a yellow square flat on the table.");
  b.on("square", "yellow", [1, 0], [2, 0]);
  b.step("Put another yellow square next to it. The boat is made of banana.");
  b.on("tri-right", "yellow", [2, 1], [2, 0]);
  b.step("Put a small triangle at the end. The front of the boat.");
  b.on("tri-right", "yellow", [0, 1], [-1, 1]);
  b.step("Put a small triangle at the other end. The back of the boat.");
  b.on("tri-isosceles-tall", "red", [0.5, 1], [1.5, 1]);
  b.step("Put a tall triangle on top. The sail!");
  return b.build({ id: "banana-boat", title: "A banana boat", theme: "vehicles", age: "a", stars: 1, flat: true, done: "You made a banana boat! Don't eat it before you get to the island." });
}

function grumpyRobot(): Project {
  const b = new Builder();
  b.on("square-large", "blue", [0, 0], [2, 0]);
  b.step("Put a big blue square flat on the table. It is the robot's face.");
  b.on("square", "purple", [-1, 0.5], [0, 0.5]);
  b.step("Put a square next to it. An ear.");
  b.on("square", "purple", [2, 0.5], [3, 0.5]);
  b.step("A square on the other side. Two ears.");
  b.on("tri-equilateral", "red", [0.5, 2], [1.5, 2]);
  b.step("A triangle on top. Its beeper.");
  b.on("tri-right", "orange", [1.5, 0], [0.5, 0]);
  b.step("A small triangle under the face. It is grumpy because it needs a charge.");
  return b.build({ id: "grumpy-robot", title: "A grumpy robot", theme: "space", age: "a", stars: 1, flat: true, done: "You made a grumpy robot! Give it a hug. Beep boop. Better." });
}

function wobblyJelly(): Project {
  const b = new Builder();
  b.lid("square", "red", 0, 0, 0);
  b.step("Put a red square flat on the table. It is the plate.");
  b.room("green", 0, 0, 1, 1, 0);
  b.chunk(1, [
    "Stand a green square up on the front side of the plate.",
    "Stand another square up on the next side. They touch at the corner.",
    "Stand a square up on the back side.",
    "Stand the last square up. Wobble, wobble!",
  ]);
  b.lid("square", "green", 0, 1, 0);
  b.step("Put a square flat on top. The jelly has a lid.");
  b.wallX("tri-equilateral", "red", 0, 1, 1);
  b.step("Stand a red triangle up on top, at the front. A cherry!");
  return b.build({ id: "wobbly-jelly", title: "A wobbly jelly", theme: "patterns", age: "a", stars: 1, done: "You made a wobbly jelly! Give the table a tiny shake. Does it wobble?" });
}

function burpingFrog(): Project {
  const b = new Builder();
  b.on("square", "green", [0, 0], [1, 0]);
  b.step("Put a green square flat on the table.");
  b.on("square", "green", [1, 0], [2, 0]);
  b.step("Put another green square next to it. This is the frog.");
  b.on("tri-equilateral", "green", [0, 1], [1, 1]);
  b.step("Put a triangle on top of one square. An eye.");
  b.on("tri-equilateral", "green", [1, 1], [2, 1]);
  b.step("Put a triangle on top of the other square. Two eyes.");
  b.on("tri-right", "red", [1.5, 0], [0.5, 0]);
  b.step("Put a small red triangle under the frog. Its tongue. BURP!");
  return b.build({ id: "burping-frog", title: "A burping frog", theme: "animals", age: "a", stars: 1, flat: true, done: "You made a burping frog! Excuse me, frog. Say pardon." });
}

export const AGE_A2: Project[] = [snail(), shark(), bananaBoat(), grumpyRobot(), wobblyJelly(), burpingFrog()];
