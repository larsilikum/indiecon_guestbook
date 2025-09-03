const BaseURL = "https://co-o-pub.space";
// const BaseURL = ""

const ApiURL = BaseURL + "/api/";

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
      const c = this.colors[entry.id];
      if (!c) this.setEntryColor(entry);
      return this.colors[entry.id];
    },
    setEntryColor(entry) {
      if (this.colors[entry.id]) return;
      const parentColor = this.colors[entry.parent_id];
      let color = getRandomEntryFromArray(this.possibleColors);
      if (parentColor) {
        const filteredColors = this.possibleColors.filter(
          (c) => c !== parentColor
        );
        color = getRandomEntryFromArray(filteredColors);
      }
      this.colors[entry.id] = color;
    },
  });

  Alpine.store("story", {
    entries: [],
    async init() {
      await this.fetch();
    },
    async fetch() {
      try {
        await fetch(`${ApiURL}post`)
          .then((r) => r.json())
          .then((d) => {
            this.entries = d.data;
            Alpine.store("currentEntry").setEntry(d.data[d.data.length - 1]);
            this.entries.forEach((entry) => {
              Alpine.store("colors").setEntryColor(entry);
            });
          });
      } catch (e) {
        console.error(e);
      }
    },
    existsInStory(id) {
      return this.entries.findIndex((el) => el.id === id) >= 0;
    },
    switchBranch(entries) {
      this.entries = entries;
    },
    appendPostedEntry(entry) {
      this.entries.push(entry);
      Alpine.store("currentEntry").setEntry(entry);
    },
    async handleFormClick() {
      scrollDownContainer();
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
      if (Alpine.store("ui").posted) {
        Alpine.store("ui").posted = false;
        await this.fetch();
      }
    },
  });

  Alpine.data("branch", (b) => {
    // console.log(b);
    return {
      branch: b,
    };
  });

  Alpine.data("audio", (src, id) => ({
    src,
    id,
    duration: "0:00",
    audioRef: null,
    seekRef: null,
    playState: false,
    currentTime: "0:00",
    volume: 100,
    // store audio ref for other functions to use
    setAudioRef(el) {
      this.audioRef = el;
    },
    setSeekRef(el) {
      this.seekRef = el;
    },
    // calculate duration of audio to display
    onLoadedMetadata(el) {
      if (el.readyState === 0) return;
      const secs = el.duration;
      this.seekRef.max = Math.floor(secs);
      this.duration = this.formatSeconds(secs);
    },
    // when seeking through the audio
    seekInput(el) {
      this.currentTime = this.formatSeconds(el.value);
      this.updateSeekStyle();
    },
    // when seeking is done and mouse is lifted
    seekChange(el) {
      this.audioRef.currentTime = el.value;
      // this.updateSeekStyle()
    },
    // when clicking play button
    playPauseAudio() {
      if (!this.playState) {
        this.audioRef.play();
        this.playState = true;
      } else {
        this.audioRef.pause();
        this.playState = false;
      }
    },
    // when audio is playing and time gets updated
    onTimeUpdate() {
      this.seekRef.value = Math.floor(this.audioRef.currentTime);
      this.updateSeekStyle();
      this.currentTime = this.formatSeconds(this.audioRef.currentTime);
    },
    // helper function to format seconds into (m)m:ss format
    formatSeconds(secs) {
      const minutes = Math.floor(secs / 60);
      const seconds = Math.floor(secs % 60);
      const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
      return `${minutes}:${returnedSeconds}`;
    },

    updateSeekStyle() {
      this.seekRef.style = `--val: ${
        (this.seekRef.value / this.seekRef.max) * 100
      }%; --per: ${this.seekRef.value / this.seekRef.max};`;
    },
  }));

  Alpine.store("treeData", {
    entries: [],
    branches: [],
    tree: [],
    async init() {
      await this.initTree();
    },
    // initialize tree from server
    async initTree() {
      this.tree = [];
      await fetch(`${ApiURL}posts`)
        .then((r) => r.json())
        .then((d) => {
          this.entries = d.data;
          this.entries.forEach((entry) => {
            Alpine.store("colors").setEntryColor(entry);
          });
          this.branches = this.buildBranches(this.entries);
          this.tree = this.appendChildrenToBranch(this.branches[0]);

          // console.log("Entries:", this.entries);
          // console.log("Branches:", this.branches);
          console.log("Tree:", this.tree);

          // Alpine.store("currentEntry").setEntry(d.data[d.data.length - 1]);
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

    switchBranch(entry) {
      Alpine.store("story").switchBranch(
        this.searchEntryInTree(this.tree, entry)
      );
      Alpine.nextTick(() => {
        console.log(document.getElementById(entry.author + entry.id));
        document.getElementById(entry.author + entry.id)?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
        // setTimeout(() => {
        // }, 100)
      });
    },

    searchEntryInTree(branch, entry) {
      let entries = [];
      const lastEntry = branch[branch.length - 1];
      if (Array.isArray(lastEntry)) {
        entries = branch.slice(0, branch.length - 1);
      } else {
        entries = branch;
      }
      const idx = branch.findIndex((e) => entry.id === e.id);
      if (idx >= 0) {
        return entries;
      }
      if (Array.isArray(lastEntry)) {
        for (b of lastEntry) {
          const res = this.searchEntryInTree(b, entry);
          if (res) {
            entries.push(...res);
            return entries;
          }
        }
      }
      return null;
    },
  });

  Alpine.data("useForm", () => ({
    selectedType: "text",
    mobileOpen: false,
    isSubmitting: false,
    imageFile: "",
    imagePreview: false,
    soundFile: "",
    soundPreview: false,
    ctx: null,
    drawing: false,
    color: "black",
    penSizes: [5, 10, 20],
    penSize: 5,
    lastDrawPos: { x: 0, y: 0 },

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
          response = await fetch(`${ApiURL}posts`, {
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
            console.log(this.$refs.imageFile);
            const fileInput = this.$refs.imageFile;
            formData.append("image", fileInput.files[0]);
          } else if (this.selectedType === "sound") {
            const fileInput = this.$refs.soundFile;
            formData.append("sound", fileInput.files[0]);
          } else if (this.selectedType === "sketch") {
            const blob = await new Promise((resolve) => {
              this.$refs.canvas.toBlob(resolve, "image/png");
            });
            formData.append("image", blob, "sketch.png");
            formData.set("type", "image");
          }

          response = await fetch(`${ApiURL}posts`, {
            method: "POST",
            body: formData,
          });
        }

        if (response.ok) {
          const result = await response.json();
          console.log("Upload successful:", result);
          Alpine.store("story").appendPostedEntry(result);
          await Alpine.store("treeData").initTree();

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
        this.mobileOpen = false
      }
    },

    initCanvas() {
      const cvs = this.$refs.canvas;
      const rect = cvs.getBoundingClientRect();
      cvs.width = rect.width;
      cvs.height = rect.height;
      this.ctx = cvs.getContext("2d");
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(0, 0, rect.width, rect.height);
    },

    cancelDraw() {
      this.drawing = false;
      this.lastDrawPos = { x: 0, y: 0 };
    },

    drawCanvas(e) {
      if (!this.drawing) return;
      this.ctx.fillStyle = this.color;
      if (!(this.lastDrawPos.x === 0 && this.lastDrawPos.y === 0)) {
        const deltaX = this.lastDrawPos.x - e.layerX;
        const deltaY = this.lastDrawPos.y - e.layerY;
        const dist = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        const steps = Math.floor((dist / this.penSize) * 2);
        for (let i = 0; i < steps; i++) {
          const x =
            (e.layerX - this.lastDrawPos.x) * (i / steps) + this.lastDrawPos.x;
          const y =
            (e.layerY - this.lastDrawPos.y) * (i / steps) + this.lastDrawPos.y;
          this.ctx.fillRect(
            x - this.penSize / 2,
            y - this.penSize / 2,
            this.penSize,
            this.penSize
          );
        }
      }
      this.ctx.fillRect(
        e.layerX - this.penSize / 2,
        e.layerY - this.penSize / 2,
        this.penSize,
        this.penSize
      );
      this.lastDrawPos = { x: e.layerX, y: e.layerY };
    },

    changeRangeStyle(el) {
      el.style = `--val: ${((el.value - 5) / (el.max - 5)) * 100}%; --per: ${
        (el.value - 5) / (el.max - 5)
      };`;
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
window.addEventListener("resize", scrollDownContainer);

// HELPER
function getRandomEntryFromArray(arr) {
  const randInt = Math.floor(Math.random() * arr.length);
  return arr[randInt];
}
