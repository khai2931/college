/*
 * College Inclusiveness Search Team
 * February 2025
 *
 * This file provides functionality for filtering through colleges,
 * by state, accomodation or inclusivity needs.
 */

"use strict";

const NO_COLLEGES_FOUND = "<li>No colleges match your criteria.</li>";

// anonymous function that runs everything
(async function() {
  window.addEventListener("load", init);

  let colleges;
  let currentIndexes = [0, 1, 2];
  let nameToRating = {};

  /**
   * Display the initial webpage, assign event listeners
   */
  async function init() {

    colleges = await getCollegesFromDatabase();

    await displayInitialColleges();
    setInterval(rotateColleges, 7000);
    qs("#search-bar input").addEventListener("input", showSuggestions);
    qs("#search-bar input").addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        filterColleges();
      }
    });
    qs("#search-bar .btn").addEventListener("click", filterColleges);
    id("clear-filters-btn").addEventListener("click", clearFilters);
    document.getElementById("selectState").addEventListener("change", filterColleges);
    qsa(".filter-option").forEach(checkbox => {
      checkbox.addEventListener("change", filterColleges);
    });

  }

  /**
   * Clears all filters so that default screen is shown
   */
  function clearFilters() {
    qsa(".filter-option").forEach(checkbox => checkbox.checked = false);
    id("selectState").value = "None";
    id("search").value = "";

    displayInitialColleges();

    let carousel = id("college-carousel");
    let resultsContainer = id("results");
    let statusMessage = id("search-status");

    resultsContainer.innerHTML = "";
    statusMessage.textContent = "";

    carousel.classList.remove("hidden");
    carousel.style.opacity = "0";
    setTimeout(() => {
      carousel.style.transition = "opacity 2s ease-in";
      carousel.style.opacity = "1";
    }, 50);
  }



  /**
   * Shows search suggestions in search bar
   * @returns {undefined} - if no search is made, nothing is done
   */
  async function showSuggestions() {
    let query = this.value;
    if (!query) {
      return;
    }
    let suggestions = await getRequest("/search/" + query, res => res.json());
    id("suggestions").innerHTML = "";
    for (let i = 0; i < suggestions.length; i++) {
      let option = gen("option");
      option.value = suggestions[i];
      id("suggestions").appendChild(option);
      option.setAttribute("role", "option");
      option.setAttribute("tabindex", "0");

    }
  }

  /**
   * Filter collges to display based on filters selected, state selected or name of the university searched for
   */
  function filterColleges() {
    let searchQuery = id("search").value.toLowerCase().trim();
    let selectedFilters = Array.from(document.querySelectorAll(".filter-option:checked"))
        .map(cb => cb.value);
    let selectedState = document.getElementById("selectState").value;

    let filteredColleges = colleges.filter(college => {
      let matchesSearch = searchQuery ? college.name.toLowerCase().includes(searchQuery) : true;
      let stateMatches = selectedState === "None" ? true : college.location.trim().toLowerCase() === selectedState.trim().toLowerCase();
      let matchesFilters = selectedFilters.length === 0 || selectedFilters.every(filter => college.accommodations.includes(filter));

      return matchesSearch && matchesFilters && stateMatches;
    });
    updateResults(filteredColleges);
  }

  /**
   * Display the colleges that match the filtering
   * @param {object} filteredColleges - the colleges that match the filtering
   */
  function updateResults(filteredColleges) {
    let resultsContainer = id("results");
    let statusMessage = id("search-status");

    id("college-carousel").classList.add("hidden");
    resultsContainer.innerHTML = "";

    // khai: fix bug where clicking filters quickly makes results show everything (even with filters)
    if (filteredColleges.length > 100) {
      filteredColleges = filteredColleges.slice(0, 100);  // just first 100 results
    }

    if (filteredColleges.length > 0) {
      filteredColleges.forEach(async college => {
        let card = document.createElement("div");
        card.classList.add("college-card2");

        // khai: fix bug where clicking filters quickly makes results show everything (even with filters)
        let ratingAvgs = nameToRating[college.name];
        if (!ratingAvgs) {
          nameToRating[college.name] = await getRequest("/rating-avgs/" + college.name, res => res.json());
          ratingAvgs = nameToRating[college.name];
          for (const [key, value] of Object.entries(ratingAvgs)) {
            ratingAvgs[key] = round(ratingAvgs[key]);
          }
        }
        card.innerHTML = `
          <h3>${college.name}</h3>
          <p><strong>Accessibility Rating:</strong> ${ratingAvgs["overallAccess_avg"] ? ratingAvgs["overallAccess_avg"] : "N/A"} out of 5</p>
          <p><strong>Inclusivity Rating:</strong> ${ratingAvgs["overallIdentity_avg"] ? ratingAvgs["overallIdentity_avg"] : "N/A"} out of 5</p>
          <p><strong>Location:</strong> ${college.location}</p>
          <p><strong>Accommodations:</strong>
          ${Array.isArray(college.accommodations) && college.accommodations.length > 0
              ? college.accommodations.join(", ")
              : "N/A"}
          </p>
        `;
        resultsContainer.appendChild(card);
        card.addEventListener("click", () => {
          window.location.href= 'college.html?name=' + college.name;
        });
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.addEventListener("keypress", (event) => {
          if (event.key === "Enter") {
            window.location.href = 'college.html?name=' + college.name;
          }
        });
      });
      statusMessage.textContent = `${filteredColleges.length} results found.`;

    } else {
      resultsContainer.innerHTML = NO_COLLEGES_FOUND;
      statusMessage.textContent = "No results found.";
    }

    resultsContainer.classList.remove("hidden");
    statusMessage.classList.add("hidden");
  }

  /**
   * Display the initial cplleges on the carousel,
   * making sure it's the three universities we have data for
   */
  async function displayInitialColleges() {
    let collegesWithData = colleges.filter(college =>
      ["University of Washington", "Stanford University", "Yale University"].includes(college.name)
    );

    if (collegesWithData.length === 3) {
      currentIndexes = [0, 1, 2];
    }

    id("left-card").innerHTML = await generateCardHTML(collegesWithData[0]);
    id("center-card").innerHTML = await generateCardHTML(collegesWithData[1]);
    id("right-card").innerHTML = await generateCardHTML(collegesWithData[2]);

    const urlParams = new URLSearchParams(window.location.search);
    let collegeName = urlParams.get("name");
    if (collegeName) {
      qs("#search-bar input").value = collegeName;
      filterColleges();
    }
  }

  /**
   * Make the carousel rotate
   * @returns {undefined} - undefined if collegesWithData has length < 3
   */
  function rotateColleges() {
    let collegesWithData = colleges.filter(college =>
      ["University of Washington", "Stanford University", "Yale University"].includes(college.name)
    );
    if (collegesWithData.length < 3) return;
    let leftCard = id("left-card");
    let centerCard = id("center-card");
    let rightCard = id("right-card");

    leftCard.style.transition = "transform 2s ease-in-out";
    centerCard.style.transition = "transform 2s ease-in-out";
    rightCard.style.transition = "transform 2s ease-in-out";

    leftCard.style.transform = "translateX(100%)";
    centerCard.style.transform = "translateX(100%)";
    rightCard.style.transform = "translateX(100%)";

    setTimeout(async () => {
      currentIndexes = currentIndexes.map(i => (i + 1) % collegesWithData.length);

      leftCard.style.transition = "none";
      centerCard.style.transition = "none";
      rightCard.style.transition = "none";

      leftCard.style.transform = "translateX(0%)";
      centerCard.style.transform = "translateX(0%)";
      rightCard.style.transform = "translateX(0%)";

      rightCard.innerHTML = centerCard.innerHTML;
      centerCard.innerHTML = leftCard.innerHTML;

      leftCard.innerHTML = await generateCardHTML(collegesWithData[currentIndexes[0]]);

      setTimeout(() => {
        leftCard.style.transition = "transform 2s ease-in-out";
        centerCard.style.transition = "transform 2s ease-in-out";
        rightCard.style.transition = "transform 2s ease-in-out";
      }, 50);
    }, 1000);
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
   * Return an HTML card for the college on carousel
   * @param {object} college - the college to make card fpr
   * @returns {string} - HTML card for the college on carousel
   */
  async function generateCardHTML(college) {
    let ratingAvgs = await getRequest("/rating-avgs/" + college.name, res => res.json());
    for (const [key, value] of Object.entries(ratingAvgs)) {
      ratingAvgs[key] = round(ratingAvgs[key]);
    }
    return `<div onClick="window.location.href = 'college.html?name=${college.name}'">
              <h3>${college.name}</h3>
              <p><strong>Accessibility:</strong> ${ratingAvgs["overallAccess_avg"] ? ratingAvgs["overallAccess_avg"] : "N/A"} out of 5</p>
              <p><strong>Inclusivity:</strong> ${ratingAvgs["overallIdentity_avg"] ? ratingAvgs["overallIdentity_avg"] : "N/A"} out of 5</p>
              <p><strong>Location:</strong> ${college.location}</p>
            </div>
            `;
  }

  /**
   * Gets college infos from the database for all colleges
   * @returns {Array} - array of colleges fetched, each with detailed info about the college
   */
  async function getCollegesFromDatabase() {
    try {
      let res = await fetch("/colleges");
      await statusCheck(res);
      res = await res.json();

      for (let i = 0; i < res.length; i++) {
        res[i]["accommodations"] = JSON.parse(res[i]["accommodations"]);
        for (let j = 0; j < res[i]["accommodations"].length; j++) {
          // khai: dcc fix
          if (res[i]["accommodations"][j] === "dcc") {
            res[i]["accommodations"][j] = "Disability Cultural Center";
          }
        }
        try {
          res[i]["resources"] = JSON.parse(res[i]["resources"]);
        } catch (e) {
          // khai: this is too verbose for final
          // console.warn("Malformed JSON in resources:", res[i]["resources"]);
          res[i]["resources"] = [];
        }
      }

      return res;
    } catch (err) {
      console.error("Error fetching colleges:", err);
      return [];
    }
  }


  /* --- HELPER FUNCTIONS --- */

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} name - element ID.
   * @returns {object} - DOM object associated with id.
   */
  function id(name) {
    return document.getElementById(name);
  }

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
   * Returns all element matching selector.
   * @param {string} selector - CSS query selector.
   * @returns {object[]} - DOM object associated selector.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
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