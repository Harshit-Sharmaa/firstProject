import React, { useState } from "react";
import GoogleLogin from "react-google-login";
import ProjectList from "./projectlist";


const App = () => {

    var gapi = window.gapi;
    var CLIENT_ID = "426198526474-nl3s921nvk4fee7rq1h9tti9mchlb8ub.apps.googleusercontent.com";
    var API_KEY = "AIzaSyDcU_IIewgaHhNXycmBNyUmEtT4Jc9y7EI";
    var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
    var SCOPES = "https://www.googleapis.com/auth/calendar.events";

    const [loginData, setLoginData] = useState(
        localStorage.getItem('loginData')
            ? JSON.parse(localStorage.getItem('loginData'))
            : null
    )
    const [gData, setgData] = useState(localStorage.getItem('gData')
        ? JSON.parse(localStorage.getItem('gData'))
        : null)


    const handleClick = () => {
        gapi.load("client:auth2", () => {
            console.log("loaded client")

            gapi.client.init({
                apiKey: API_KEY,
                clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                discoverDocs: DISCOVERY_DOCS,
                scopes: SCOPES,
            })



            gapi.auth2.getAuthInstance().signIn()
                .then(
                    async (googleData) => {
                        setgData(googleData)
                        localStorage.setItem('gData', JSON.stringify(googleData))
                        console.log(googleData)
                        const res = await fetch("https://myproject-6bfe7-default-rtdb.firebaseio.com/myProject.json", {
                            method: 'POST',
                            body:
                                JSON.stringify({
                                    token: googleData.tokenId,
                                }),
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        })
                        const data = await res.json();
                        console.log(googleData)
                        setLoginData(data)
                        localStorage.setItem('loginData', JSON.stringify(data))
                    }
                )

        })

    }

    const handleLogout = () => {
        localStorage.removeItem('loginData')
        localStorage.removeItem('gData')
        setLoginData(null)
        setgData(null)
    }

    const [inWork, setWork] = useState({ task: "", date: "" });
    const [fWork, setfWork] = useState([])
    console.log(inWork)
    const saveTodo = async (e) => {
        e.preventDefault();
        const res = await fetch(
            "https://myproject-6bfe7-default-rtdb.firebaseio.com/myProject.json",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    fWork[fWork.length - 1]
                )
            })
        setfWork((oldWork) => {
            return [...oldWork, inWork]
        })
        setWork({ task: "", date: "" });
        gapi.load("client:auth2", () => {
            console.log("loaded client")

            gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                discoverDocs: DISCOVERY_DOCS,
                scopes: SCOPES,
            })


            gapi.client.load("calendar", "v3", () => {
                console.log('Harshit')
                var event = {
                    'summary': inWork.task,
                    'location': 'Karnal,Haryana',
                    'description': 'Work Harshit has to do',
                    'start': {
                        'dateTime': new Date().toISOString(),
                        'timeZone': 'America/Los_Angeles'
                    },
                    'end': {
                        'dateTime': new Date(inWork.date).toISOString(),
                        'timeZone': 'America/Los_Angeles'
                    },
                    'recurrence': [
                        'RRULE:FREQ=DAILY;COUNT=2'
                    ],
                    'attendees': [
                        { 'email': 'sharmaharshit552@gmail.com' },
                        { 'email': 'harshit@es.iitr.ac.in' }
                    ],
                    'reminders': {
                        'useDefault': false,
                        'overrides': [
                            { 'method': 'email', 'minutes': 24 * 60 },
                            { 'method': 'popup', 'minutes': 10 }
                        ]
                    }
                }
                console.log(event)
                console.log(gapi.client.calendar)
                var request = gapi.client.calendar.events.insert({
                    'calendarId': 'primary',
                    'resource': event
                });
                console.log('yash1')
                request.execute(event => {
                    console.log(event)
                    console.log(event.htmlLink)
                })
                console.log("wooh")
            })
        })

    }

    return (
        <div className="loginPage">

            {
                loginData && gData ? (
                    <div className="todoPage">


                        <div className="poora">
                            <div className="center_div">
                                <div className="heading">
                                    <button onClick={handleLogout} className="outButton">Log out</button>
                                    <h1 className="wtd">What to do?</h1>

                                </div>
                                <hr />
                                <div className="todo_i">
                                    <form method="POST">
                                        <span> <input
                                            type="text"
                                            placeholder="write the to do here"
                                            value={inWork.task}
                                            onChange={e => { setWork({ ...inWork, task: e.target.value }) }}
                                            className="t"
                                            required /></span>
                                        <span> <input
                                            type="date"
                                            value={inWork.date}
                                            onChange={e => { setWork({ ...inWork, date: e.target.value }) }}
                                            className="d"
                                            required /></span>
                                        <span><button onClick={saveTodo} className="addB">Add Event</button></span>
                                    </form>
                                </div>
                                <hr />
                                <div className="todo_d">
                                    <ul>
                                        {fWork.map((fvalue) => {
                                            return <ProjectList
                                                tvalue={fvalue.task}
                                                dvalue={fvalue.date}
                                            />
                                        })}
                                    </ul>

                                </div>
                            </div>
                        </div>
                    </div>

                ) : (
                    <>
                        <h1>React Google Login App</h1>
                        <GoogleLogin
                            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                            buttonText="Log in"
                            cookiePolicy={'single_host_origin'}
                            className="bButton"
                        ></GoogleLogin>
                        <button
                            onClick={handleClick}
                            className="gButton"

                        >Log in to add events</button>
                    </>
                )
            }
        </div>
    )
}
export default App;

