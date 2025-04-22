document.querySelector('#search').addEventListener('click', fetchPokemon);

function lowerCaseName(string) {
  return string.toLowerCase();
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// get a particular pokemon
function fetchPokemon(e){
  const name = document.querySelector("#pokemonName").value;
  const pokemonName = lowerCaseName(name);

  // DEFUNCT - Strip variant after hyphen for species query (i.e. for deoxys, minior, maushold, etc)
  // const baseName = pokemonName.split("-")[0];

  fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    .then(response => {
      if (!response.ok) throw new Error("Pokémon not found");
      return response.json();
    })
    .then(pokemonData => {
      return fetch(pokemonData.species.url)
        .then(response => response.json())
        .then(speciesData => ({ pokemonData, speciesData }));
    })
    .then(({ pokemonData, speciesData }) => { //process data
      var realFeet = pokemonData.height * 0.32808; //dm to decimal ft
      var feet = Math.floor(realFeet);
      var inches = Math.round((realFeet - feet) * 12);
      var weightInLbs = (pokemonData.weight * .22046).toFixed(2) //hg to lbs
      var typeNames = pokemonData.types.map(typeInfo => capitalizeFirstLetter(typeInfo.type.name)).join(', '); // map() creates array of Type names from array of objects
      var abilityNames = pokemonData.abilities.map(abilityInfo => capitalizeFirstLetter(abilityInfo.ability.name)).join(', ');
      var cryLatest = pokemonData.cries.latest;

      var flavorTexts = speciesData.flavor_text_entries
        .filter(entry => entry.language.name === "en").slice(0, 2).map(entry => entry.flavor_text.replace(/\f|\n|\r/g, " ").trim()); //get first 2 english dex entries
        // Display them in your HTML
        let flavorHTML = flavorTexts.map(text => `<p><em>${text}</em></p>`).join('');

      var dexNum = speciesData.pokedex_numbers.find(num => num.pokedex.name === "national")?.entry_number;



      document.querySelector(".pokemonBox").innerHTML = `
        <div>
          <img src="${pokemonData.sprites.other["official-artwork"].front_default}" class="card-img-top" alt="${capitalizeFirstLetter(pokemonData.name)}">
          <section class="pokemonInfo">
            <p class="pokemon-name">${capitalizeFirstLetter(pokemonData.name)}</p>
            <p>Height: ${inches >= 12 ? feet + 1 : feet}'${inches >= 12 ? 0 : inches}"</p>
            <p>Weight: ${weightInLbs} lbs</p>
            <p>Type: ${typeNames}</p>
            <p>Ability: ${abilityNames}</p>
          </section>
        </div>
      `

      document.querySelector(".speciesBox").innerHTML = `
        
        <section class="speciesInfo">
          <p>National Dex #${dexNum}</p>
          <p>Pokedex Info:</p>
          ${flavorHTML}
          <p>Cry: </p>
          <audio controls src="${cryLatest}"></audio>
        </section>
        
      `
    }) 

    .catch((err) => {
      console.error('Pokemon not found:', err);
      alert("Pokemon not found :(");
    });

    e.preventDefault();
  }


//---------autocomplete method 1 (algolia)-------//

//get list of all pokemon for autocomplete
// var searchTerms = ['abra', 'zubat', 'articuno', 'zapdos', 'moltres', 'pikachu', 'eevee', 'vaporeon', 'lopunny', 'roserade', 'weavile'];

// function autocompleteMatch(input) {
//   if (input == '') {
//     return [];
//   }
//   var reg = new RegExp(input)
//   return searchTerms.filter(function(term) {
// 	  if (term.match(reg)) {
//   	  return term;
// 	  }
//   });
// }

// function showResults(val) {
//   res = document.getElementById("result");
//   res.innerHTML = '';
//   let list = '';
//   let terms = autocompleteMatch(val);
//   for (i=0; i<terms.length; i++) {
//     list += '<li>' + terms[i] + '</li>'; //generates series of <li> items using terms array
//   }
//   res.innerHTML = '<ul>' + list + '</ul>';
// }

//-------autocomplete method 1 end------//

//--------autocomplete method 2 (ChatGPT) ---------// 

// create array of all Pokemon names from API
let allPokemonNames = [];

async function fetchAllPokemonNames() {
  if (allPokemonNames.length > 0) return; // only fetch once

  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1300");
  const data = await res.json();
  allPokemonNames = data.results.map(pokemon => pokemon.name);
}

// autocomplete after user types 3 characters into search
function autocompleteMatch(input) {
  input = input.toLowerCase();
  if (input.length < 3) return [];

  return allPokemonNames.filter(name => name.startsWith(input)).slice(0, 10); // limit results
}

// interactive search results (clickable)
function showResults(val) {
  const res = document.getElementById("result");
  res.innerHTML = '';

  if (val.length < 3) return;

  const terms = autocompleteMatch(val);
  if (terms.length === 0) return;

  const ul = document.createElement('ul');
  ul.classList.add('autocomplete-list');

  terms.forEach(name => {
    const li = document.createElement('li');
    li.textContent = name;
    li.classList.add('autocomplete-item');
    li.addEventListener('click', () => {
      document.querySelector("#pokemonName").value = name;
      res.innerHTML = '';
      fetchPokemon(); // assuming this is your main fetch/display function
    });
    ul.appendChild(li);
  });

  res.appendChild(ul);
}


document.querySelector("#pokemonName").addEventListener("input", async (e) => {
  await fetchAllPokemonNames();
  showResults(e.target.value);
});
