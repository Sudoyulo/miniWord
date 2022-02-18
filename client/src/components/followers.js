import React, { useEffect, useState } from "react";
import './leftSidebar.css'
import axios from "axios";

const Followers = (props) => {

  const { userAvatar, userInitials, user_id, userinfo, gameid } = props;

  const [allAvatars, setAllAvatars] = useState([]);
  const [user, setUser] = useState([userinfo])
  const [myAvatar, setMyAvatar] = useState(userAvatar);
  const [myInitials, setInitials] = useState(userInitials);
  const [followsList, setFollowsList] = useState([]);
  const [friendInput, setFriendInput] = useState("");


  const getAvatars = () => {
    axios('http://localhost:5001/avatars')
      .then(res => {
        // console.log("RES AVATAR: ", res.data)
        const list = []
        res.data.forEach((id) => {
          list.push(id.avatar_url)
        })
        setAllAvatars(list);
      })
  }

  const getUser = () => {
    axios('http://localhost:5001/users/' + user_id)
      .then(res => {
        setMyAvatar(res.data[0].avatar_url)
        setInitials(res.data[0].initials)
        setUser(res.data)
      })
  }

  const setUserAvatar = (uid, aid, avatar) => {
    axios.put('http://localhost:5001/users/' + uid + '/avatar/' + (aid + 1))
      .then(res => {
        // console.log("RES AVATAR PUT: ", res.data)
        setMyAvatar(avatar);
      })
  }

  const setUserInitials = (uid, str) => {
    axios.put('http://localhost:5001/users/' + uid + '/initials/' + str)
      .then(res => {
        // console.log("RES INIT PUT: ", res.data)
        setInitials(str);
      })
  }

  const getMyFollowers = () => {
    const followerData = [];
    const followerIds = [];

    // console.log("getting my friends myid:", user_id, "game #:", gameid)
    axios('http://localhost:5001/getmyfriends/' + user_id)
      .then(res => {
        // console.log("client, get my friends", res.data.rows)
        res.data.rows.forEach(entry => { followerIds.push(entry.friendid) })
        // console.log("fd", followerIds)
        const promises = [];
        followerIds.forEach(person => {

          const p = axios('http://localhost:5001/users/' + person)
            .then(res => {
              // console.log("each friend data", res.data)
              followerData.push(res.data)
            })
          promises.push(p)
        })

        // console.log("all friend data", followerData)
        Promise.all(promises)
          .then(
            () => setFollowsList(followerData)

          )

      })
  }

  const addFriend = (friendId) => {

    console.log("adding friend", user_id, friendId)
    axios.put('http://localhost:5001/newfollow/' + user_id + '/' + friendId)
      .then(res => {
        console.log(res)
      })

    setFriendInput("")
  }


  useEffect(() => {

    // console.log("fl", followsList)
  }, [followsList])

  // called here because of reload issues
  useEffect(() => {
    getUser();
    getMyFollowers();
  }, [])

  useEffect(() => {
    getAvatars();
  }, [myAvatar])

  //this is a list of all avatars source code
  //setMyAvatar(avatar)
  const selectAvatar = allAvatars.map((avatar, index) => {
    return (<button key={index} onClick={() => { setUserAvatar(user_id, index, avatar) }}><img className="avatar" alt="avatar-icon" src={avatar} /></button>)
  })

  //max three
  const changeInitials = (value) => {

    if (myInitials.length < 4) {
      setUserInitials(user_id, value.slice(0, 3).toUpperCase());
      setInitials(value.slice(0, 3).toUpperCase())
    }
  }

  const followers = followsList.map((friendsGames, index) => {
    console.log("fl friend", friendsGames)
    const firstFriend = friendsGames[0];
    if (!firstFriend) { //vertify that is it not undefined
      return ""
    }

    let turnsWin = 0;
    const friendPlayed = friendsGames.find(game => game.id === gameid)

    turnsWin = friendPlayed ? friendPlayed.turns_taken : 0

    return (
      <div key={index} className="friend-info" >

        <img className="avatar" src={firstFriend.avatar_url} alt="friend avatar" />
        <p> {firstFriend.initials}#{firstFriend.user_id}</p>
        {turnsWin ? <button className="complete">See my {turnsWin} turn replay</button> : <button className="complete"> #{gameid} incomplete</button>}
      </div>
    )

  })

  return (

    <div className="left-sidebar">

      <div className="side-title">
        Social
      </div>

      <div className="user-data">
        <p><img className="avatar" src={myAvatar} alt="Avatar" />  </p>
        <p>{myInitials} </p>
      </div>
      <div className="avatar-initials">
        <div className="avatar-container">
          Choose an avatar:
          <div className="avatar-list">
            {selectAvatar}
          </div>
        </div>
        <br />
        <div className="initial-container" >
          <div>

            Set Initials: &nbsp;
            <input className="initials-box" placeholder="LHL" value={myInitials} onChange={(e) => { changeInitials(e.target.value) }}></input>

          </div>
          <div> Your id: {user_id} </div>
        </div>
      </div>

      <div className="following-list">
        {followers}
      </div>

      <div className="add-a-friend" >
        <input className="add-input" placeholder="Enter follower id:" value={friendInput} onChange={(e) => { setFriendInput(e.target.value) }} ></input>
        <button className="add-button" onClick={() => { addFriend(friendInput) }}> Add friend </button>
      </div>

    </div >

  );

}
export default Followers;