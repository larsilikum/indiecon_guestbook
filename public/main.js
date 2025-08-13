// const BaseURL = "https://staging.co-o-pub.space/api/" 
const BaseURL = "/api/"

document.addEventListener("alpine:init", () => {
  Alpine.store("currentEntry", {
    entry: null,
    setEntry (entry) {
      this.entry = entry
    },
  })

  Alpine.data("entryData", () => ({
    entries: null,
    init () {
      try {
        fetch(`${BaseURL}post`)
          .then((r) => r.json())
          .then((d) => {
            console.log(d)
            this.entries = d.data
            Alpine.store("currentEntry").setEntry(d.data[d.data.length - 1])
          })
      } catch (e) {
        console.error(e)
      }
    },
  }))

  Alpine.data("useForm", () => ({
    selectedType: 'text',
    isSubmitting: false,

    getData () {
      const inputs = Array.from(this.$el.querySelectorAll("input[name='author']"))
      const data = inputs.reduce(
        (object, input) => ({ ...object, [input.name]: input.value }),
        {}
      )

      // Add parent_id and type
      data.parent_id = Alpine.store("currentEntry").entry?.id
      data.type = this.selectedType

      // Add content based on type
      if (this.selectedType === 'text') {
        const textarea = this.$el.querySelector("textarea[name='content']")
        data.content = textarea.value
      }

      return data
    },

    async submitEntry () {
      if (this.isSubmitting) return

      this.isSubmitting = true

      try {
        let response

        if (this.selectedType === 'text') {
          // Send as JSON for text posts
          response = await fetch(`${BaseURL}posts`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.getData()),
          })
        } else {
          // Send as FormData for file uploads
          const formData = new FormData()
          const data = this.getData()

          // Add text fields to FormData
          formData.append('author', data.author)
          formData.append('type', data.type)
          if (data.parent_id) {
            formData.append('parent_id', data.parent_id.toString())
          }

          // Add file based on type
          if (this.selectedType === 'image') {
            const fileInput = this.$refs.imageFile
            formData.append('image', fileInput.files[0])
          } else if (this.selectedType === 'sound') {
            const fileInput = this.$refs.soundFile
            formData.append('sound', fileInput.files[0])
          }

          response = await fetch(`${BaseURL}posts`, {
            method: "POST",
            body: formData,
          })
        }

        if (response.ok) {
          const result = await response.json()
          console.log('Upload successful:', result)

          // Reset form
          this.$el.reset()
          this.selectedType = 'text'

        } else {
          const error = await response.text()
          console.error('Upload failed:', error)
          alert('Upload failed: ' + error)
        }
      } catch (error) {
        console.error('Network error:', error)
        alert('Network error: ' + error.message)
      } finally {
        this.isSubmitting = false
      }
    },
  }))
})
