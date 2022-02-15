import React, { Fragment, useState, useEffect } from "react";
import axios from "axios";
import './guessContainer.css'
import Keyboard from "./keyboard";


const GuessContainer = (props) => {

  const { board, setBoard, solution, pos, setPos, user, gameId, completedGames } = props;

  const [message, setMessage] = useState("");
  const [userGame, setUserGame] = useState([]);


  const guessRows = board.map((row, rowIndex) => {
    return (
      <div key={row + rowIndex} className={"row row-" + rowIndex}> {
        row.map((col, colIndex) => {
          let color = "black";
          return (
            <div id={rowIndex.toString() + colIndex.toString()} key={col + colIndex} style={{ backgroundColor: color }} className={"col col-" + colIndex}>{col}</div>
          )
        })
      }</div>
    );
  })

  const changeKeyColour = (key, colour) => {
    const button = document.getElementById(key)
    button.classList.add(colour)
  }
  const flipTile = () => {

    let userGuess = board[pos.row]
    let answer = solution
    let checkSolution = answer
    let guess = []


    userGuess.forEach((tile, index) => {
      tile = document.getElementById(pos.row.toString() + index.toString())
      guess.push({ lett: tile.textContent, colour: 'grey-overlay' })

      guess.forEach((guess, index) => {
        if (guess.lett === answer[index]) {
          guess.colour = 'green-overlay'
          checkSolution = checkSolution.replace(guess.lett, '')
        }
      })

      guess.forEach(guess => {
        if (checkSolution.includes(guess.lett)) {
          guess.colour = 'yellow-overlay'
          checkSolution = checkSolution.replace(guess.lett, '')
        }
      })

      setTimeout(() => {
        tile.classList.add('flip')
        tile.classList.add(guess[index].colour)
      }, 500 * index)

      setTimeout(() => {
        changeKeyColour(guess[index].lett, guess[index].colour)
      }, 2500)

    })
  };


  const getUserGame = (user, gid) => {
    // console.log("getting game", user, gid)

    if (user[0] && gid) {
      // console.log("fetching", user[0].user_id, gameId)
      axios('http://localhost:5001/user_game/' + user[0].user_id + "/" + gid)
        .then(res => {
          // console.log("usergame", res.data.rows)
          setUserGame(res.data.rows)
        })
    }

  }

  const makeUserGame = (user, gid, guess) => {
    console.log("making game", user, gid, guess)

    if (user[0] && gid && guess) {
      console.log("making", user[0].user_id, gameId, guess)
      axios.put('http://localhost:5001/new_user_game/' + user[0].user_id + "/" + gid + "/" + guess)
        .then(res => {
          console.log("make", res.data.rows)
          setUserGame(res.data.rows)
        })
    }

  }

  // console.log("user", user);
  //  console.log("cg gid", completedGames, gameId)

  const saveGuess = (guess) => {
    console.log("guess, row num, ugid", guess, userGame[0].id)

    axios.put('http://localhost:5001/guesses/' + userGame[0].id + "/" + guess)
      .then(res => {
        console.log("inserted new guess")
      })
  };

  const saveWin = (turns) => {
    console.log("saving won game", turns);

    axios.put('http://localhost:5001/win_user_game/' + turns + "/" + userGame[0].id)
      .then(res => {
        console.log("inserted new win")
      })
  };



  useEffect(() => {
    getUserGame(user, gameId);
  }, [userGame])


  const handleKeypress = (key) => {

    console.log("KEY: ", key)

    const copyBoard = [...board];

    const handleDelete = () => {
      if (pos.col > 0) {
        console.log("backspace")
        setPos({ ...pos, col: pos.col - 1 })
        copyBoard[pos.row][pos.col - 1] = " "
        setBoard(copyBoard)
      } else {
        setMessage("cant go back any further")
        setTimeout(() => { setMessage("") }, 2000)
      }
    }

    const handleEnter = () => {

      //saveGuess(userGuess, pos.row + 1)


      if (pos.col === 5) {
        flipTile()
        let userGuess = board[pos.row].join('')
        let goodGuess = true; // this is a real word
        console.log("solution guess", solution, userGuess)

        if (goodGuess) {

          if (!completedGames.includes(gameId)) { //not completed game

            if (userGame.length === 0) { // user_game doesnt exist
              console.log("create new user_game and guesses", user[0].user_id, gameId)
              makeUserGame(user, gameId, userGuess)
              getUserGame(user, gameId)
              console.log("first guess, making new guesses table", userGame)


              if (solution === userGuess) {
                //correct
                console.log("FIRST GUESS WIN??!?!?")
                setMessage("Perfect")
                saveGuess(userGuess)
                saveWin(pos.row + 1)
                //setTimeout(() => { setMessage("") }, 2000)

              }

            } else { //continuing a game

              if (solution === userGuess) {
                //correct
                setMessage("Perfect")
                saveGuess(userGuess)
                saveWin(pos.row + 1)
                //setTimeout(() => { setMessage("") }, 2000)

              } else { // move on
                setPos({ ...pos, row: pos.row + 1, col: 0 })
                console.log("moving on")

                if (pos.row < 6) {
                  console.log("more guesses left ugid row", userGame, pos.row + 1)
                  //move on
                  setMessage(userGuess + " is incorrect. Try again.") // 6-row tries left
                  saveGuess(userGuess)
                  console.log("saved guess to existing guesses row")
                  //update guesses
                  setTimeout(() => { setMessage("") }, 2000)
                } else {
                  setMessage("Game over")
                } //end row < 5
              }

            }


          } else {
            console.log("You have finished this game already")
          }


        } else {
          console.log("not a good word")
        }

        /////////////
        if (solution === userGuess) {
          console.log("pos", pos)
          //correct
          setMessage("Perfect")
          //setTimeout(() => { setMessage("") }, 2000)
        } else {
          setPos({ ...pos, row: pos.row + 1, col: 0 })

          if (pos.row < 5) {
            //move on
            setMessage(userGuess + " is incorrect. Try again.") // 6-row tries left
            setTimeout(() => { setMessage("") }, 2000)
          } else {
            setMessage("Game over")
          }
        }
        /////////////
      } else { //reject the enter button
        setMessage("need a 5 letter word")
        setTimeout(() => { setMessage("") }, 2000)
      }
    }

    const addLetter = (letter) => {
      // console.log("pos", pos)
      //pointer is in bounds < 5 meaning 0-4 is not filled up
      if (pos.row > 5) {
        setMessage("Game over")
      } else if (pos.col < 5) {
        copyBoard[pos.row][pos.col] = letter
        setBoard(copyBoard)
        setPos({ ...pos, col: pos.col + 1 })
      } else {
        setMessage('no space to enter letter ' + letter)
        setTimeout(() => { setMessage("") }, 2000)
      }
    }

    //handlers start here
    if (key === "<<") {
      handleDelete();
    } else if (key === "ENTER") {
      handleEnter();
    } else {
      addLetter(key);
    }

  }

  return (
    <Fragment >

      <div className="message">
        {message}
        <p>&nbsp;</p>
      </div>

      <div className="tile-container">
        {guessRows}
      </div>

      <Keyboard onKeypress={handleKeypress} />

    </Fragment>

  );

}
export default GuessContainer;