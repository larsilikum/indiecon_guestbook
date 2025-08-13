const BaseURL = "https://staging.co-o-pub.space/api/"; // change to /api/ in production

document.addEventListener("alpine:init", () => {
  Alpine.store("currentEntry", {
    entry: null,
    setEntry(entry) {
      this.entry = entry;
    },
  });

  Alpine.data("entryData", () => ({
    entries: null,
    init() {
      try {
        fetch(`${BaseURL}post`)
          .then((r) => r.json())
          .then((d) => {
            console.log(d);
            this.entries = d.data;
            Alpine.store("currentEntry").setEntry(d.data[d.data - 1]);
          });
      } catch (e) {
        console.error(e);
      }
    },
  }));

  Alpine.data("useForm", () => ({
    data() {
      const inputs = Array.from(this.$el.querySelectorAll("input, textarea"));
      const data = inputs.reduce(
        (object, key) => ({ ...object, [key.name]: key.value }),
        {}
      );
      data.parent_id = Alpine.store("currentEntry").entry?.id;
      data.type = "text";
      return data;
    },

    async submitEntry() {
      return await await fetch(`${BaseURL}posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.data()),
      });
    },
  }));
});
