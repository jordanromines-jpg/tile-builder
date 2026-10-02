/* Projects for 3 to 5 (plan keys 6h, 6i): one tile a step, 3 to 12 tiles, flat pictures or small builds that stand.
   Every one builds from a Magna-Tiles 32. Words from the 3–5 list (DESIGN.md, Copy): square, triangle, side, corner,
   flat, big, small, on top, under, next to, up, down. */
import type { Project } from "../engine/types";
import { Builder } from "./helpers";

function fish(): Project {
  const b = new Builder();
  b.on("square", "blue", [1, 0], [2, 0]);
  b.step("Put a blue square flat on the table. This is the fish's body.");
  b.on("tri-equilateral", "orange", [2, 1], [2, 0]);
  b.step("Put an orange triangle next to the square. It is the fish's head.");
  b.on("tri-equilateral", "yellow", [0.134, 1], [0.134, 0]);
  b.step("A yellow triangle on the other side makes the tail. Its corner touches the square.");
  b.on("tri-right", "green", [1, 1], [2, 1]);
  b.step("Last, a small green triangle on top. That is the fin.");
  return b.build({ id: "fish", title: "A fish", theme: "animals", age: "a", stars: 1, flat: true, done: "You made a fish! Can it swim across the table?" });
}

function cat(): Project {
  const b = new Builder();
  b.on("square-large", "orange", [0, 0], [2, 0]);
  b.step("Put a big orange square flat on the table. This is the cat's face.");
  b.on("tri-equilateral", "orange", [0, 2], [1, 2]);
  b.step("Put a triangle on top, at one corner. That is an ear.");
  b.on("tri-equilateral", "orange", [1, 2], [2, 2]);
  b.step("Put one more triangle on top, next to it. Two ears.");
  b.on("tri-right", "purple", [1, 0], [0, 0]);
  b.step("Under the face, put a small purple triangle.");
  b.on("tri-right", "purple", [1, 0], [1, -1]);
  b.step("One more small triangle next to it makes a bow.");
  return b.build({ id: "cat", title: "A cat face", theme: "animals", age: "a", stars: 1, flat: true, done: "You made a cat! What will you call it?" });
}

function house(): Project {
  const b = new Builder();
  b.on("square", "red", [0, 0], [1, 0]);
  b.step("Put a red square flat on the table.");
  b.on("square", "red", [1, 0], [2, 0]);
  b.step("Put another red square next to it, side by side.");
  b.on("tri-equilateral", "blue", [0, 1], [1, 1]);
  b.step("Put a blue triangle on top of one square.");
  b.on("tri-equilateral", "blue", [1, 1], [2, 1]);
  b.step("Put a blue triangle on top of the other square.");
  b.on("tri-equilateral", "green", [1.5, 1 + Math.sqrt(3) / 2], [0.5, 1 + Math.sqrt(3) / 2]);
  b.step("Fit a green triangle upside down in the gap. Now the roof is whole.");
  return b.build({ id: "house", title: "A little house", theme: "homes", age: "a", stars: 1, flat: true, done: "You made a house! Who lives there?" });
}

function flower(): Project {
  const b = new Builder();
  b.on("square", "yellow", [0, 0], [1, 0]);
  b.step("Put a yellow square flat on the table. It is the middle of the flower.");
  b.on("tri-equilateral", "red", [0, 1], [1, 1]);
  b.step("Put a red triangle on top of the square.");
  b.on("tri-equilateral", "red", [1, 1], [1, 0]);
  b.step("Put a red triangle next to the square, on this side.");
  b.on("tri-equilateral", "red", [0, 0], [0, 1]);
  b.step("And one more red triangle on the other side.");
  b.on("square", "green", [0, -1], [1, -1]);
  b.step("Put a green square under the flower. That is the stem.");
  b.on("tri-right", "green", [1, 0], [1, -1]);
  b.step("A small green triangle next to the stem makes a leaf.");
  return b.build({ id: "flower", title: "A flower", theme: "gardens", age: "a", stars: 2, flat: true, done: "You made a flower! Count the petals." });
}

function rocket(): Project {
  const b = new Builder();
  b.on("square", "blue", [0, 0], [1, 0]);
  b.step("Put a blue square flat on the table.");
  b.on("square", "blue", [0, 1], [1, 1]);
  b.step("Put another blue square on top of it. The rocket is tall.");
  b.on("tri-equilateral", "red", [0, 2], [1, 2]);
  b.step("A red triangle on top is the rocket's nose.");
  b.on("tri-right", "orange", [0, 0], [0, 1]);
  b.step("Put a small orange triangle at the bottom corner. A fin.");
  b.on("tri-right", "orange", [1, 0], [2, 0]);
  b.step("And one more fin on the other side. Ready to fly.");
  return b.build({ id: "rocket", title: "A rocket", theme: "space", age: "a", stars: 2, flat: true, done: "You made a rocket! Three, two, one, go!" });
}

function car(): Project {
  const b = new Builder();
  b.on("square", "red", [0, 0], [1, 0]);
  b.step("Put a red square flat on the table.");
  b.on("square", "red", [1, 0], [2, 0]);
  b.step("Put another red square next to it.");
  b.on("square", "blue", [0.5, 1], [1.5, 1]);
  b.step("Put a blue square on top, in the middle. That is where the driver sits.");
  b.on("tri-right", "yellow", [2, 0], [3, 0]);
  b.step("A small yellow triangle at the front.");
  b.on("tri-right", "yellow", [0, 0], [0, 1]);
  b.step("And one at the back. Beep beep.");
  return b.build({ id: "car", title: "A car", theme: "vehicles", age: "a", stars: 2, flat: true, done: "You made a car! Where will it go?" });
}

function box(): Project {
  const b = new Builder();
  b.lid("square", "green", 0, 0, 0);
  b.step("Put a green square flat on the table. It is the floor.");
  const says = [
    "Stand a square up on the front side of the floor.",
    "Stand another square up on the next side. The two touch at the corner.",
    "Stand a square up on the back side.",
    "Stand the last square up. Now it is a box.",
  ];
  b.room("blue", 0, 0, 1, 1, 0);
  b.chunk(1, says);
  return b.build({ id: "box", title: "A little box", theme: "patterns", age: "a", stars: 1, done: "You made a box! What can you put inside?" });
}

function tunnel(): Project {
  const b = new Builder();
  b.lid("square", "yellow", 0, 0, 0);
  b.step("Put a yellow square flat on the table. It is the road.");
  b.wallZ("square", "blue", 0, 0, 0);
  b.step("Stand a blue square up on one side of the road.");
  b.wallZ("square", "blue", 1, 0, 0);
  b.step("Stand a blue square up on the other side.");
  b.lid("square", "red", 0, 1, 0);
  b.step("Grown-up, hold the sides while your builder puts a red square flat on top.");
  return b.build({ id: "tunnel", title: "A bridge for a car", theme: "bridges", age: "a", stars: 1, done: "You made a bridge! Drive a car under it." });
}

function tower(): Project {
  const b = new Builder();
  b.lid("square", "green", 0, 0, 0);
  b.step("Put a green square flat on the table.");
  const low = ["Stand a blue square up on one side.", "Stand a blue square up next to it.", "Stand a blue square up on the back.", "One more blue square. A box with no lid."];
  b.room("blue", 0, 0, 1, 1, 0);
  b.chunk(1, low);
  const high = ["Put a purple square on top of a blue one.", "Put a purple square on top, next to it.", "Another purple square on top.", "The last purple square. The tower is tall."];
  b.room("purple", 0, 0, 1, 1, 1);
  b.chunk(1, high);
  return b.build({ id: "tower", title: "A castle tower", theme: "castles", age: "a", stars: 3, done: "You made a tower! It is as tall as two squares." });
}

function kennel(): Project {
  const b = new Builder();
  b.lid("square", "yellow", 0, 0, 0);
  b.step("Put a yellow square flat on the table. It is the floor.");
  const walls = ["Stand a red square up on the front.", "Stand a red square up on this side.", "Stand a red square up on the back.", "Stand a red square up on the last side."];
  b.room("red", 0, 0, 1, 1, 0);
  b.chunk(1, walls);
  b.lowRoof("blue", 0, 0, 1);
  b.step("Grown-up, help your builder lean four blue triangles in on top. Their corners meet. That is the roof.");
  return b.build({ id: "kennel", title: "A dog's kennel", theme: "animals", age: "a", stars: 3, done: "You made a kennel! A dog can sleep inside." });
}

export const AGE_A: Project[] = [fish(), cat(), house(), flower(), rocket(), car(), box(), tunnel(), tower(), kennel()];
