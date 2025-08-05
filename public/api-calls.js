const BaseURL = "https://staging.co-o-pub.space/api/" // change to /api/ in production

async function getLeafPost() {
  try {
    const response = await fetch(BaseURL + 'post')
    const json = await response.json()
    console.log(json)
    return json
  }
  catch (e) {
    console.error(e)
  }
}

getLeafPost()