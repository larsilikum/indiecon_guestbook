// function styleEntries() {
//   const treeEntries = document.querySelectorAll(".tree-entry");
//   const fetchedEntries = document.querySelectorAll(".entry");

//   const colors = [
//     "#FF8366",
//     "#66FF8A",
//     "#668AFF",
//     "#F7D86F",
//     "#B78ED2",
//     "#F0A55C",
//   ];

//   treeEntries.forEach((entry) => {
//     const userId = entry.getAttribute("data-user");
//     // const color = colors[Math.floor(Math.random() * colors.length)];
//     let found = false;

//     fetchedEntries.forEach((fetchedEntry) => {
//       if (fetchedEntry.getAttribute("data-user") === userId) {
//         // fetchedEntry.style.color = color;
//         // entry.style.backgroundColor = color;
//         //entry.style.border = `0.2rem solid ${color}`;

//         const mediaEntry =
//           fetchedEntry.classList.contains("image-part") ||
//           fetchedEntry.classList.contains("sound-part");

//         if (mediaEntry) {
//           // fetchedEntry.style.backgroundColor = color;
//         }
//         found = true;
//       }
//     });

//     if (!found) {
//       // entry.style.backgroundColor = color;
//       entry.classList.add("notFetched");
//     }
//   });
// }

//++cool hover effect
// function hoverEntries(e) {
//   const entryID = e.getAttribute("data-user");

//   const treeEntries = document.querySelectorAll(".tree-entry");
//   const normalEntries = document.querySelectorAll(".entry");

//   const toggleHover = (entries, id, add) => {
//     entries.forEach((entry) => {
//       if (entry.getAttribute("data-user") === id) {
//         if (add) {
//           entry.classList.add("hovered");
//         } else {
//           entry.classList.remove("hovered");
//         }
//       }
//     });
//   };

//   // Add hovered class
//   toggleHover(treeEntries, entryID, true);
//   toggleHover(normalEntries, entryID, true);
// }

// function unhoverEntries(e) {
//   const entryID = e.getAttribute("data-user");

//   const treeEntries = document.querySelectorAll(".tree-entry");
//   const normalEntries = document.querySelectorAll(".entry");

//   const toggleHover = (entries, id, add) => {
//     entries.forEach((entry) => {
//       if (entry.getAttribute("data-user") === id) {
//         if (add) {
//           entry.classList.add("hovered");
//         } else {
//           entry.classList.remove("hovered");
//         }
//       }
//     });
//   };

//   toggleHover(treeEntries, entryID, false);
//   toggleHover(normalEntries, entryID, false);
// }
