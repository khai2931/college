/*
 * College Inclusiveness Search Team
 * February 2025
 *
 * This file provides the functionality for college pages,
 * such as displaying reviews, average ratings, and general info.
 */

"use strict";

// anonymous function that runs everything
(async function() {
  window.addEventListener("load", () => {
    getCollegeData().then(() => init());
  });

  let collegeName;
  let collegeData;
  let ratingAvgs;
  let reviews;

  /**
   * Sets up event listeners for the buttons.
   */
  function init() {
    id("rate-btn").addEventListener("click", openRatingForm);

    const urlParams = new URLSearchParams(window.location.search);
    collegeName = urlParams.get("name");
    qs("#college-name a").textContent = collegeName;


    updateCollegeInfo(ratingAvgs);
    populateAccomodations();
    populateReviews();
  }

  /**
   * Lists the accomodations for a college
   */
  function populateAccomodations() {
    let accoms = JSON.parse(collegeData["accommodations"]);
    id("accoms").innerHTML = "";

    if (accoms.length === 0) {
      id("accoms").innerHTML = "<p>No accommodations found.</p>";
    }
    for (let i = 0; i < accoms.length; i++) {
      let accom = gen("li");
      accom.textContent = accoms[i];
      // khai: dcc fix
      if (accoms[i] === "dcc") {
        accom.textContent = "Disability Cultural Center";
      }
      id("accoms").appendChild(accom);
    }
  }

  /**
   * returns style such that BG color is
   * poor (red): [1 - 2.9]
   * okay (yellow): [3 - 3.9]
   * good (green): [4.0 - 5.0]
   * @param {*} num - the rating
   * @returns {string} - the relevant style
   */
  function getColor(num) {
    if (num < 3) {
      return "poor";
    } else if (num < 4) {
      return "okay";
    } else {
      return "good";
    }
  }

  /**
   * generates bar such that 1-5 -> 20% to 100% of bar filled
   * returns the approriate CSS style for the num
   * @param {number} num - integer 1 to 5
   * @returns {string} - the right style for the bar
   */
  function barStyle(num) {
    let numToNum = {
      1 : "one",
      2 : "two",
      3 : "three",
      4 : "four",
      5 : "five",
    }
    return numToNum[num] ? numToNum[num] : "";
  }

  /**
   * Lists the reviews for a college
   * @returns {undefined} if there are no reviews
   */
  function populateReviews() {
    if (!reviews) {
      return;
    }
    id("n-ratings").textContent = reviews.length;
    for (let i = 0; i < reviews.length; i++) {
      let rev = reviews[i];
      let box = gen("div");
      box.classList.add("rating-box");
      box.innerHTML =
`
<div class="rating-header" aria-label="student review:">
    <div class="Overall-section">
      <h4>Overall Accessibility</h4>
      <span id="bubble" tabindex="0" class="rating-score ${getColor(rev.overallAccess_rating)}">${rev.overallAccess_rating}</span>
      <h4>Overall Identity</h4>
      <span class="rating-score ${getColor(rev.overallIdentity_rating)}">${rev.overallIdentity_rating}</span>
    </div>
    <div class="review-text">
      <h4 >General Review</h4>
      <p  >${rev.general_review ? rev.general_review : "<em>No review provided.</em>"}</p>
      <h4  >Identity-focused Review</h4>
      <p  >${rev.identity_review ? rev.identity_review : "<em>No review provided.</em>"}</p>
    </div>
  </div>
  <div class="rating-category">
    <p  >LGBTQ+ Friendliness: ${rev.lgbtq_safety} out of 5</p>
    <div class="rating-bar ${barStyle(rev.lgbtq_safety)}"></div>
  </div>
  <div class="rating-category">
    <p  >Liberal Climate: ${rev.liberal_rating} out of 5</p>
    <div class="rating-bar ${barStyle(rev.liberal_rating)}"></div>
  </div>
  <div class="rating-category">
    <p >Accommodation Friendliness: ${rev.accommodation_rating} out of 5</p>
    <div class="rating-bar ${barStyle(rev.accommodation_rating)}"></div>
  </div>
  <div class="rating-category">
    <p >Accommodation Difficulty: ${rev.accommodations_difficulty} out of 5</p>
    <div class="rating-bar ${barStyle(rev.accommodations_difficulty)}"></div>
  </div>
  <div class="rating-category">
    <p  >Accommodation Reliability: ${rev.reliability_rating} out of 5</p>
    <div class="rating-bar ${barStyle(rev.reliability_rating)}"></div>
  </div>
  <div class="rating-category">
    <p  >Peer Support: ${rev.supportive_rating} out of 5</p>
    <div class="rating-bar ${barStyle(rev.supportive_rating)}"></div>
  </div>
  <div class="rating-category">
    <p  >Indoor Campus Accessibility: ${rev.inside_accessibility} out of 5</p>
    <div class="rating-bar ${barStyle(rev.inside_accessibility)}"></div>
  </div>
  <div class="rating-category">
    <p  >Outdoor Campus Accessibility: ${rev.outside_rating} out of 5</p>
    <div class="rating-bar ${barStyle(rev.outside_rating)}"></div>
  </div>
  <div class="rating-category">
    <p >Cultural & Racial Diversity: ${rev.diversity_rating} out of 5</p>
    <div class="rating-bar ${barStyle(rev.diversity_rating)}"></div>
  </div>
  <div class="rating-category">
    <p >Religious Tolerance: ${rev.tolerance_rating} out of 5</p>
    <div class="rating-bar ${barStyle(rev.tolerance_rating)}"></div>
  </div>
  <div class="rating-category">
    <p >Club Inclusivity: ${rev.clubs_rating} out of 5</p>
    <div class="rating-bar ${barStyle(rev.clubs_rating)}"></div>
  </div>
</div>
`;
      id("reviews-right").appendChild(box);
    }
  }

  /**
   * Opens the rating form
   */
  function openRatingForm() {
    window.open(`/survey.html?name=${encodeURIComponent(collegeName)}`, "_blank");//new window open
  }

  /**
   * returns num rounded to exactly 1 decimal place
   * if 0 return "N/A"
   * @param {*} num - a number
   * @returns {number | string} - the num rounded to exactly 1 decimal place, if 0 return "N/A"
   */
  function round(num) {
    num = (Math.round(num * 100) / 100).toFixed(1);
    return num == 0 ? "N/A" : num;
  }

  /**
   * returns num rounded to whole number
   * if 0 return "N/A"
   * @param {*} num - a number
   * @returns {number | string} - the num rounded to whole number, if 0 return "N/A"
   */
  function roundPerc(num) {
    num = (Math.round(num * 100) / 100).toFixed(0);
    return num == 0 ? "N/A" : num;
  }

  /**
   * Gets college data
   */
  async function getCollegeData() {
    const urlParams = new URLSearchParams(window.location.search);
    collegeName = urlParams.get("name");

    collegeData = await getRequest("/colleges/" + collegeName, res => res.json());
    ratingAvgs = await getRequest("/rating-avgs/" + collegeName, res => res.json());
    for (const [key, value] of Object.entries(ratingAvgs)) {
      ratingAvgs[key] = round(ratingAvgs[key]);
    }
    reviews = await getRequest("/all-reviews/" + collegeName, res => res.json());

    if (reviews) {
      // replace null with "N/A" in individual ratings
      for (let i = 0; i < reviews.length; i++) {
        let review = reviews[i];
        for (const [key, value] of Object.entries(review)) {
          review[key] = review[key] ? review[key] : "N/A";
        }
      }
    }
  }

  /**
   * Lists average ratings for a college
   * @param {Object} data - contains average ratings as fields in this object
   */
  async function updateCollegeInfo(data) {
    let percentData = await getRequest("/stats/" + collegeName, res => res.json());

    id("lgbtq_id").textContent = roundPerc(percentData["friendly_score"]);
    id("exclusionary").textContent = roundPerc(percentData["exclusionary_score"]);
    id("friendly").textContent = roundPerc(percentData["lgbtq_score"]);
    id("mobility").textContent = roundPerc(percentData["mobility_score"]);

    let resources = collegeData["resources"].split("||")[0].trim();
    resources = resources.substring(1, resources.length - 1);
    let link = resources.split("|")[1].trim();
    if (!link.toLowerCase().startsWith("https://") && !link.toLowerCase().startsWith("http://")) {
      link = "https://" + link;
    }



    id("college-name").innerHTML = `<a id="college-title" href ="${link}" target="_blank">${collegeName}</a>`;

    let overallInclusivity = qs("#overall-inclusivity .overall-display");
    overallInclusivity.textContent = data["overallIdentity_avg"];
    overallInclusivity.classList.remove("poor", "okay", "good");
    overallInclusivity.classList.add(getColor(data["overallIdentity_avg"]));


    let overallAccessibility = qs("#overall-accessibility .overall-display");
    overallAccessibility.textContent = data["overallAccess_avg"];
    overallAccessibility.classList.remove("poor", "okay", "good");
    overallAccessibility.classList.add(getColor(data["overallAccess_avg"]));


    let lgbtqRating = qs("#lgbtq-rating .rating-display");
    lgbtqRating.textContent = data["lgbtq_avg"];
    lgbtqRating.classList.remove("poor", "okay", "good");
    lgbtqRating.classList.add(getColor(data["lgbtq_avg"]));


    let accommodationRating = qs("#accommodation-rating .rating-display");
    accommodationRating.textContent = data["rating_avg"];
    accommodationRating.classList.remove("poor", "okay", "good");
    accommodationRating.classList.add(getColor(data["rating_avg"]));


    let outdoorRating = qs("#outdoor-accessibility .rating-display");
    outdoorRating.textContent = data["outside_avg"];
    outdoorRating.classList.remove("poor", "okay", "good");
    outdoorRating.classList.add(getColor(data["outside_avg"]));


    let indoorRating = qs("#indoor-accessibility .rating-display");
    indoorRating.textContent = data["inside_avg"];
    indoorRating.classList.remove("poor", "okay", "good");
    indoorRating.classList.add(getColor(data["inside_avg"]));


    let supportRating = qs("#peer-support .rating-display");
    supportRating.textContent = data["supportive_avg"]
    supportRating.classList.remove("poor", "okay", "good");
    supportRating.classList.add(getColor(data["supportive_avg"]));


    let liberalRating = qs("#liberal .rating-display");
    liberalRating.textContent = data["liberal_avg"];
    liberalRating.classList.remove("poor", "okay", "good");
    liberalRating.classList.add(getColor(data["liberal_avg"]));


    let culturalRating = qs("#cultural-diversity .rating-display");
    culturalRating.textContent = data["diversity_avg"];
    culturalRating.classList.remove("poor", "okay", "good");
    culturalRating.classList.add(getColor(data["diversity_avg"]));


    let religiousRating = qs("#religious-tolerance .rating-display");
    religiousRating.textContent = data["tolerance_avg"];
    religiousRating.classList.remove("poor", "okay", "good");
    religiousRating.classList.add(getColor(data["tolerance_avg"]));


    // inclusiveness of clubs
    let clubsRating = qs("#club-inclusiveness .rating-display");
    clubsRating.textContent = data["clubs_avg"];
    clubsRating.classList.remove("poor", "okay", "good");
    clubsRating.classList.add(getColor(data["clubs_avg"]));

    // khai & danielle: added 3 new averages;
    /* difficulty of getting accomodations*/
    let difficultyRating = qs("#difficulty-rating .rating-display");
    difficultyRating.textContent = data["difficulty_avg"];
    difficultyRating.classList.remove("poor", "okay", "good");
    difficultyRating.classList.add(getColor(data["difficulty_avg"]));
    // reliability of accomodations
    let relibilityRating = qs("#reliability-rating .rating-display");
    relibilityRating.textContent = data["reliability_avg"];
    relibilityRating.classList.remove("poor", "okay", "good");
    relibilityRating.classList.add(getColor(data["reliability_avg"]));
  }


  /* --- HELPER FUNCTIONS --- */

  /**
   * returns result of GET request with extractFunc being
   * either res => res.json() or res => res.text()
   * @param {string} url - URL to fetch
   * @param {function} extractFunc - res => res.json() or res => res.text()
   * @returns {object | string | undefined} - res.json(), res.text(), or undefined
   */
  async function getRequest(url, extractFunc) {
    try {
      let res = await fetch(url);
      await statusCheck(res);
      res = await extractFunc(res);
      return res;
    } catch (err) {
      handleError();
      console.error("Post error: ", err);
    }
  }

  /**
   * Handles errors gracefully
   */
  function handleError() {
    alert("There was an issue processing something. Please try again.");
  }

  /**
   * If res does not have an ok HTML response code, throws an error.
   * Returns the argument res.
   * @param {object} res - HTML result
   * @returns {object} -  same res passed in
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} name - element ID.
   * @returns {object} - DOM object associated with id.
   */
  function id(name) {
    return document.getElementById(name);
  }

  /**
   * Returns first element matching selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} - DOM object associated selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns a new HTML element matching the tag.
   * @param {string} tagName - HTML tag name.
   * @returns {object} - new HTML element matching the tag.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

})();