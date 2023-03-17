//Matches by date


//Get html components
const listeperdate = document.querySelector('.listeperdate')
const xhrperdate = new XMLHttpRequest();
const xhrperdate_events = new XMLHttpRequest();
const competitionSelect = document.getElementById("competition-select");
const dateControl = document.getElementById('date');

//Set up variable today if no new date applied
const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, '0');
const day = today.getDate().toString().padStart(2, '0');
const today_default = `${year}${month}${day}`;


function updatePage_perdate() {

  //////////////////////////////////////////////////// FRONT OF EACH CARD //////////////////////////////////////////////////////////////////

  var FinalDate = dateControl.value
  //If no date chosen => Define today variable to apply it by default to dateControl / Otherwise we take newdate and we apply good format
  if (FinalDate == "") {

    FinalDate = today_default

  } else {

    //Remove "-" to date to have yyyymmdd format
    FinalDate = FinalDate.replace(/-/g, "");

  }

  //Var competition name
  var competitioname1 = competitionSelect.value

  //Api URL with date variable inside
  const apiUrl_perdate = `https://livescore-football.p.rapidapi.com/soccer/matches-by-date?date=${FinalDate}`;


  //Send a request to the API and update the page
  xhrperdate.open("GET", apiUrl_perdate);
  xhrperdate.setRequestHeader("X-RapidAPI-Key", "880499bde0msh46f6dfc2b255ab7p1c2fabjsn793bf24a070a");
  xhrperdate.setRequestHeader("X-RapidAPI-Host", "livescore-football.p.rapidapi.com");
  xhrperdate.responseType = 'json';
  xhrperdate.onload = function() {
    //console.log(xhrperdate.response)

    //Clear the existing list items
    listeperdate.innerHTML = '';

    //Loop through the response data and create new list items
    for (i = 0; i < xhrperdate.response.data.length; i++) {

      const match = xhrperdate.response.data[i];
      const competitioname2 = xhrperdate.response.data[i].league_name;
      const countryname = xhrperdate.response.data[i].country_name;
      const matches = match.matches

      //If country form html form = coutry in the api response
      if ((competitioname1 == competitioname2 && (countryname == "France" || countryname == "England" || countryname == "Germany" || countryname == "Spain" || countryname == "Italy" || countryname == "Portugal")) || competitioname1 == countryname) {

        //Loop in response all fixtures for this country
        for (j = 0; j < matches.length; j++) {

          //Creation of elements to be pushed into the li (li creation "newLi")
          let newLi = document.createElement('li');
          let newTitreCarte = document.createElement('h2');
          let country_league = document.createElement('p');
          let newScore = document.createElement('p');
          let homeTeamImg = document.createElement('img');
          let awayTeamImg = document.createElement('img');
          let reddotlive = document.createElement('span');
          let divfrontli = document.createElement('div');
          let divbackli = document.createElement('div');

          //Add classes to some elements
          reddotlive.classList.add('reddot');
          divfrontli.classList.add('front-li');
          divbackli.classList.add('back-li');

          //Push elements inside front side of our card (NewLi)
          divfrontli.appendChild(homeTeamImg);
          divfrontli.appendChild(awayTeamImg);
          divfrontli.appendChild(newTitreCarte);
          divfrontli.appendChild(country_league);
          divfrontli.appendChild(newScore);
          divfrontli.appendChild(reddotlive);

          //Activate red dot if status is live => toggle class "switchedon" on reddotlive element
          const status = matches[j].status
          if (status != "NS" && status != "FT" && status != "AP") {
            reddotlive.classList.toggle("switchedon")
          }

          //Teams logos
          homeTeamImg.setAttribute('src', matches[j].team_1.logo);
          awayTeamImg.setAttribute('src', matches[j].team_2.logo);

          //Names + coutries & league + score
          newTitreCarte.innerText = matches[j].team_1.name + " vs. " + matches[j].team_2.name;
          country_league.innerText = match.country_name + " / " + match.league_name
          newScore.innerText = "Score : " + matches[j].score.full_time.team_1 + " - " + matches[j].score.full_time.team_2


          //Push front and back into NewLi and NewLi pushed into our ul
          newLi.appendChild(divfrontli);
          newLi.appendChild(divbackli);

          listeperdate.appendChild(newLi)

          //Define match ID to use for next API call
          const ID_game = matches[j].match_id

          //////////////////////////////////////////////////// BACK OF EACH CARD //////////////////////////////////////////////////////////////////

          //Flip the card => see data behind, using another API call
          newLi.addEventListener('click', function() {

            //Clear the backside of the card
            divbackli.innerText = " "

            //Add class to flip in the CSS
            newLi.classList.toggle("flipCard")

            console.log(ID_game)

            //Api URL with date variable inside
            const apiUrl_perdate_events = `https://livescore-football.p.rapidapi.com/soccer/match-events?match_id=${ID_game}`;

            //Send a request to the API and update the page
            xhrperdate_events.open("GET", apiUrl_perdate_events);
            xhrperdate_events.setRequestHeader("X-RapidAPI-Key", "880499bde0msh46f6dfc2b255ab7p1c2fabjsn793bf24a070a");
            xhrperdate_events.setRequestHeader("X-RapidAPI-Host", "livescore-football.p.rapidapi.com");
            xhrperdate_events.responseType = 'json';
            xhrperdate_events.onload = function() {
              console.log(xhrperdate_events.response)


              //Loop through the response data
              for (i = 0; i < xhrperdate_events.response.data.length; i++) {

                //Variable isgoal to check if the event is a goal (=1 if a goal)
                var isgoal = 0

                const events = xhrperdate_events.response.data[i];

                //Check if for each data we have only one event or several events
                //We take only "GOAL" events
                //We retrieve striker names for each "GOAL" event
                if (events.events == undefined) {

                  if (events.event == "GOAL" || events.event == "GOAL_PENALTY") {

                    var isgoal = 1
                    var striker = events.player_name
                    var team = events.team

                  }

                } else {

                  for (k = 0; k < events.events.length; k++) {

                    if (events.events[k].event == "GOAL" || events.events[k].event == "GOAL_PENALTY") {

                      var isgoal = 1
                      var striker = events.events[k].player_name
                      var team = events.events[k].team

                    }
                  }
                }

                //We put the striker name in the card if the variable isgoal is 1
                if (isgoal == 1) {

                  //Creation of elements to be pushed into the li (back of "newLi")
                  let striker_name = document.createElement('p');

                  //Si equipe 1 => texte vers la gauche de la carte
                  if (team == 1) {
                    striker_name.classList.toggle("team1left")
                  }

                  //Si equipe 2 => texte vers la droite de la carte
                  if (team == 2) {
                    striker_name.classList.toggle("team2right")
                  }

                  //Push elements inside front side of our card (back of "newLi")
                  divbackli.appendChild(striker_name)

                  //Striker names + minutes of goal + team
                  striker_name.innerText = events.minute + "' " + "\u26BD " + striker;
                }
              }

            }

            xhrperdate_events.send()

          })





        }
      }
    }
  }
  xhrperdate.send()

}





// Do something immediately
updatePage_perdate()

//if new contry selected => start displaying
competitionSelect.addEventListener("change", function() {

  // Do something immediately
  updatePage_perdate()

  // Call the updatePage_live function every 30 secondes (30000 milliseconds)
  setInterval(updatePage_perdate, 30000);

});

//if new date selected => start displaying
dateControl.addEventListener("change", function() {

  // Do something immediately
  updatePage_perdate()

  // Call the updatePage_live function every 30 secondes (30000 milliseconds)
  setInterval(updatePage_perdate, 30000);

});
