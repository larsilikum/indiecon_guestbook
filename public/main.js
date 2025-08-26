const BaseURL = "https://staging.co-o-pub.space/api/";
// const BaseURL = "/api/"

document.addEventListener("alpine:init", () => {
  // current Entry is to know which is the parent of the added entry
  Alpine.store("currentEntry", {
    entry: null,
    setEntry(entry) {
      this.entry = entry;
    },
  });

  Alpine.store("ui", { 
    posted: true,
    hoveredAuthor: null, 
  });

  Alpine.store("colors", {
    colors: {},
    possibleColors: [
      "#FF8366",
      "#66FF8A",
      "#668AFF",
      "#F7D86F",
      "#B78ED2",
      "#F0A55C",
    ],
    getEntryColor(entry) {
      const c = this.colors[entry.id]
      if (!c) this.setEntryColor(entry)
      return this.colors[entry.id]
    },
    setEntryColor(entry) {
      if (this.colors[entry.id]) return
      const parentColor = this.colors[entry.parent_id]
      let color = getRandomEntryFromArray(this.possibleColors)
      if (parentColor) {
        const filteredColors = this.possibleColors.filter(c => c !== parentColor)
        color = getRandomEntryFromArray(filteredColors)
      }
      this.colors[entry.id] = color
    }
  })

  window.storyRendered = false;

  Alpine.data("storyData", () => ({
    entries: [],
    init() {
      fetch(`${BaseURL}post`)
        .then((r) => r.json())
        .then((d) => {
          this.entries = d.data;
          Alpine.store("currentEntry").setEntry(d.data[d.data.length - 1])
          this.entries.forEach(entry => {
            Alpine.store("colors").setEntryColor(entry)
          })
          this.$nextTick(() => styleEntries());

          window.storyRendered = true;
        });
    },
  }));

  Alpine.data("branch", (b) => {
    console.log(b);
    return {
      branch: b,
    };
  });

  Alpine.data("treeData", () => ({
    entries: [],
    branches: [],
    tree: [],
    init() {
      fetch(`${BaseURL}posts`)
        .then((r) => r.json())
        .then((d) => {
          this.entries = d.data;
          this.entries.forEach(entry => {
            Alpine.store("colors").setEntryColor(entry)
          })
          this.branches = this.buildBranches(this.entries);
          this.tree = this.appendChildrenToBranch(this.branches[0]);

          console.log("Entries:", this.entries);
          console.log("Branches:", this.branches);
          console.log("Tree:", this.tree);

          Alpine.store("currentEntry").setEntry(d.data[d.data.length - 1]);
          if (window.storyRendered) {
            this.$nextTick(() => styleEntries());
          }
        });
    },
    //building branches
    buildBranches(entries) {
      const branches = [];
      const firstParent = entries.filter((e) => !e.parent_id);

      function build(parent, currentBranch = []) {
        const children = entries.filter((e) => e.parent_id === parent.id);

        currentBranch.push(parent);

        if (children.length === 0) {
          // keine children
          branches.push([...currentBranch]);
        } else if (children.length === 1) {
          // 1 child
          build(children[0], currentBranch);
        } else if (children.length > 1) {
          // mehr als 1 child
          branches.push([...currentBranch]);

          //function geht weiter dann mit kind
          children.forEach((child) => {
            build(child, []);
          });
        }
      }

      firstParent.forEach((parent) => build(parent, []));

      return branches;
    },

    appendChildrenToBranch(branch) {
      const lastChild = branch[branch.length - 1];
      const childrenBranches = this.branches.filter(
        (b) => b[0].parent_id === lastChild.id
      );
      if (childrenBranches.length > 0) {
        const mutatedChildren = [];
        for (const b of childrenBranches) {
          mutatedChildren.push(this.appendChildrenToBranch(b));
        }
        const cpBranch = [...branch];
        cpBranch.push(mutatedChildren);
        return cpBranch;
      }
      return branch;
    },
  }));

  Alpine.data("useForm", () => ({
    selectedType: "text",
    isSubmitting: false,

    getData() {
      const inputs = Array.from(
        this.$el.querySelectorAll("input[name='author']")
      );
      const data = inputs.reduce(
        (object, input) => ({ ...object, [input.name]: input.value }),
        {}
      );

      // Add parent_id and type
      data.parent_id = Alpine.store("currentEntry").entry?.id;
      data.type = this.selectedType;

      // Add content based on type
      if (this.selectedType === "text") {
        const textarea = this.$el.querySelector("textarea[name='content']");
        data.content = textarea.value;
      }

      return data;
    },

    async submitEntry() {
      if (this.isSubmitting) return;

      this.isSubmitting = true;

      try {
        let response;

        if (this.selectedType === "text") {
          // Send as JSON for text posts
          response = await fetch(`${BaseURL}posts`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.getData()),
          });
        } else {
          // Send as FormData for file uploads
          const formData = new FormData();
          const data = this.getData();

          // Add text fields to FormData
          formData.append("author", data.author);
          formData.append("type", data.type);
          if (data.parent_id) {
            formData.append("parent_id", data.parent_id.toString());
          }

          // Add file based on type
          if (this.selectedType === "image") {
            const fileInput = this.$refs.imageFile;
            formData.append("image", fileInput.files[0]);
          } else if (this.selectedType === "sound") {
            const fileInput = this.$refs.soundFile;
            formData.append("sound", fileInput.files[0]);
          }

          response = await fetch(`${BaseURL}posts`, {
            method: "POST",
            body: formData,
          });
        }

        if (response.ok) {
          const result = await response.json();
          console.log("Upload successful:", result);

          // Reset form
          Alpine.store("ui").posted = true; // Flag/classtoggle für globalen ui-shift wenn success
          this.$el.reset();
          this.selectedType = null;
        } else {
          const error = await response.text();
          console.error("Upload failed:", error);
          alert("Upload failed: " + error);
        }
      } catch (error) {
        console.error("Network error:", error);
        alert("Network error: " + error.message);
      } finally {
        this.isSubmitting = false;
      }
    },
  }));
});

function scrollDownContainer() {
  setTimeout(() => {
    const stories = document.querySelector(".stories");
    const tree = document.querySelector(".tree");

    if (stories) {
      stories.scrollTo({
        top: stories.scrollHeight,
        behavior: "smooth",
      });
    }

    if (tree) {
      tree.scrollTo({
        top: tree.scrollHeight,
        behavior: "smooth",
      });
    }
  }, 500);
}
scrollDownContainer();

// HELPER
function getRandomEntryFromArray(arr) {
  const randInt = Math.floor(Math.random() * arr.length)
  return arr[randInt]
}

