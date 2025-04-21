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

  Promise.all([
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`).then(response => response.json()), //get responses
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`).then(response => response.json())
  ])
    .then(([pokemonData, speciesData]) => { //process data
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
        <p>Cry: </p>
          <audio controls src="${cryLatest}"></audio>
        <section class="speciesInfo">
          <p>Pokedex Info:</p>
          ${flavorHTML}
        </section>
        
      `
    }) 

    .catch((err) => console.error('Pokemon not found :(', err));

    e.preventDefault();
  }


//---------autocomplete type1 (algolia)-------//

//get list of all pokemon for autocomplete
var searchTerms = ['abra', 'zubat', 'articuno', 'zapdos', 'moltres', 'pikachu', 'eevee', 'vaporeon', 'lopunny', 'roserade', 'weavile'];

// searchTerms.concat(function getPokemonNames() {
//   fetch("https://pokeapi.co/api/v2/pokemon/?limit=1500")
//     .then(response => response.json()) //get response object as json
//     .then(data => {
//       let pokemon = data.results;
//       let pokemonList = [];
//       for (const mon of pokemon) {
//         pokemonList.push(mon.name)
//       }
//       console.log(pokemonList) //logs array of first 100 names[0-99]
//       // need to return array of object[n].name to search names
//       return pokemonList;
//     })
// })

function autocompleteMatch(input) {
  if (input == '') {
    return [];
  }
  var reg = new RegExp(input)
  return searchTerms.filter(function(term) {
	  if (term.match(reg)) {
  	  return term;
	  }
  });
}

function showResults(val) {
  res = document.getElementById("result");
  res.innerHTML = '';
  let list = '';
  let terms = autocompleteMatch(val);
  for (i=0; i<terms.length; i++) {
    list += '<li>' + terms[i] + '</li>'; //generates series of <li> items using terms array
  }
  res.innerHTML = '<ul>' + list + '</ul>';
}

//-------autocomplete type 1 end------//

//-------autocomplete type 2 (w3schools) -------//

//replace .autocomplete with .searchbox and #myInput with with #pokemonName

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
              b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}
/*execute a function when someone clicks in the document:*/
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});
}

//-------autocomplete type 2 end------//