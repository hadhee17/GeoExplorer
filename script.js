"use strict";

const searchBox = document.querySelector("#search-box");
const searchBtn = document.querySelector("#search-button");
const btn = document.querySelector(".btn-country");
const countriesContainer = document.querySelector(".countries");
const imgContainer = document.querySelector(".images");

const getMyLocation = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

const renderCountry = function (data, className = "") {
  const html = `
          <article class="country ${className}">
            <img class="country__img" src="${data.flags["png"]}" />
            <div class="country__data">
              <h3 class="country__name">${data.name["common"]}</h3>
              <h4 class="country__region">${data.region}</h4>
              <p class="country__row"><span>👫</span>${(
                +data.population / 100000
              ).toFixed(1)}M people</p>
              <p class="country__row"><span>🗣️</span>${Object.values(
                data.languages
              )}</p>
              <p class="country__row"><span>💰</span>${
                Object.values(data.currencies)[0].name
              }</p>
            </div>
          </article>`;

  countriesContainer.insertAdjacentHTML("beforeend", html);
};

const renderError = function (msg) {
  countriesContainer.insertAdjacentText("beforeend", msg);
  // countriesContainer.style.opacity = 1;
};

const WhereAmI = async function () {
  try {
    countriesContainer.innerHTML = "";
    const myLocation = await getMyLocation();

    const { latitude: lat, longitude: lng } = myLocation.coords;

    const myLocationApi = await fetch(
      `https://us1.api-bdc.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );

    if (!myLocationApi.ok)
      throw new Error(
        `coundn't navigate your location ${myLocationApi.status}`
      );

    const myLocationCntry = await myLocationApi.json();

    // console.log(myLocationCntry);
    const { countryName } = myLocationCntry;

    const cntryInfoApi = await fetch(
      `https://restcountries.com/v3.1/name/${countryName}`
    );
    if (!cntryInfoApi.ok)
      throw new Error(`coundn't fetch country info ${cntryInfoApi.status}`);

    const cntryInfoData = await cntryInfoApi.json();
    // console.log(cntryInfoData);

    const holdOfcntryData = cntryInfoData[1]
      ? cntryInfoData[1]
      : cntryInfoData[0];

    renderCountry(holdOfcntryData);

    const [...neighbours] = holdOfcntryData.borders ?? [];
    if (neighbours.length === 0)
      throw new Error("No neighbours for this country");
    // console.log(neighbours);
    await Promise.all(
      neighbours.map(async (data) => {
        const neighbourApi = await fetch(
          `https://restcountries.com/v3.1/alpha/${data}`
        );
        const neighbourData = await neighbourApi.json();
        neighbourData.forEach((data) => {
          renderCountry(data, "neighbour");
        });
      })
    );
  } catch (err) {
    renderError(err);
  }
};

btn.addEventListener("click", WhereAmI);

const searchCntry = async function () {
  try {
    countriesContainer.innerHTML = "";

    if (!searchBox.values) console.log("no value");
    if (searchBox.value) {
      const cntryInfoApi = await fetch(
        `https://restcountries.com/v3.1/name/${searchBox.value}`
      );
      if (!cntryInfoApi.ok)
        throw new Error(`coundn't fetch country info ${cntryInfoApi.status}`);

      const cntryInfoData = await cntryInfoApi.json();
      // console.log(cntryInfoData);

      const holdOfcntryData = cntryInfoData[1]
        ? cntryInfoData[1]
        : cntryInfoData[0];

      renderCountry(holdOfcntryData);

      const [...neighbours] = holdOfcntryData.borders ?? [];
      if (neighbours.length === 0)
        throw new Error("No neighbours for this country");
      // console.log(neighbours);
      await Promise.all(
        neighbours.map(async (data) => {
          const neighbourApi = await fetch(
            `https://restcountries.com/v3.1/alpha/${data}`
          );
          const neighbourData = await neighbourApi.json();
          neighbourData.forEach((data) => {
            renderCountry(data, "neighbour");
          });
        })
      );
    }
    searchBox.value = "";
  } catch (err) {
    renderError(err);
  }
};

searchBox.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchCntry(); // Trigger the search function
  }
});

searchBtn.addEventListener("click", searchCntry);
