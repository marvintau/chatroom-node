import React, {useState, useEffect} from 'react';
import {Input, InputGroup, Button, InputGroupAddon} from 'reactstrap';
import { Toast, ToastBody, ToastHeader } from 'reactstrap';

import Sock from 'socket.io-client';

import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

const sock = Sock('http://localhost:3000');

const ErrMsgs = {
  EXPIRED: '登陆已过期，重新登录吧'
}

const log = (anything) => console.log(anything);

const useMessage = (reminder=log) => {
  const [messages, updateMessages] = useState([]);

  sock.on('message', ({message, from}) => {
    console.log(message, from)
    updateMessages([...messages, {message, from}])
  })

  const say = (message, from) => {
    sock.emit('message', {message, from});
  } 

  return {messages, say};
}

const useLogin = (reminder=log) => {

  const [user, setUser] = useState(localStorage.getItem('user'));
  const [logged, setLogged] = useState(false);

  sock.on('connect', res => {
    console.log('Connected.');
  })

  const login = (user, local=false) => {
    sock.emit('login', {user, local})
    .on('login', ({ok, error}) => {
      if (ok){
        localStorage.setItem('user', user);
        setUser(user);
        setLogged(true);
      }
      if (error){
        reminder(error);
        if (error === 'EXPIRED'){
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    });
  }

  useEffect(() => {
    if(!logged && user !== null){
      login(user, true);
    }
  }, [user, logged])

  return {user, logged, login};
}

const App = () => {

  // localStorage.setItem('user', 'marvin');

  const {user, logged, login} = useLogin();
  const {messages, say} = useMessage();

  const [inputVal, setInputVal] = useState('');

  const send = (value) => {
    logged ? say(value, user) : login(value);
    setInputVal('');
  }

  return (
    <div className="App">
      <div className='content'>
        {messages.map(({message, from}, i) => <div key={i} className='message'>
          <div><b>{from}</b></div>
          <div>{message}</div>
        </div>)}
      </div>
      <div className='input-bar'>
        <InputGroup size="sm">
          <Input
            type="text"
            placeholder={logged ? `Yo ${user}, say somethin. Type '@' to mention another friend` : `Type a nickname to login.`}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
          <InputGroupAddon addonType="append">
            <Button
              onClick={() => send(inputVal)}
              color={logged ? 'warning' : 'info'}
            >{logged ? '说' : '登录'}</Button>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
}

export default App;
