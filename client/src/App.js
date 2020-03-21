import React, {useState, useEffect, useCallback, createContext, useContext} from 'react';
import {Input, InputGroup, Button, InputGroupAddon} from 'reactstrap';
import { UncontrolledAlert } from 'reactstrap';

import Sock from 'socket.io-client';

import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

// console.log(window.location.hostname);
const sock = Sock(window.location.origin);

const log = (anything) => console.log(anything);

const useAlert = () => {
  const [content, setContent] = useState();
  const [type, setType] = useState();

  const ErrMsgs = {
    EXPIRED: 'Your session is expired. You gotta login again.',
    OCCUPIED: 'Your nickname was occupied. Pickup another.'
  }
  
  const Msgs = {
    NEW: 'Welcome!',
    BACK: 'Welcome back!'
  }

  const alert = content === undefined
  ? <></> 
  : <UncontrolledAlert color={type === 'OK' ? 'info' : 'warning'}>
      {content}
    </UncontrolledAlert>

  const reminder = ({ok, error}) => {
    console.log('calledd')
    if (ok !== undefined){
      setContent(Msgs[ok]);
      setType('OK');
    } else if (error !== undefined) {
      setContent(ErrMsgs[error]);
      setType('ERROR');
    }
  }

  return {alert, reminder};
}

const MessageContext = createContext({
  messages : [],
  say: () => {},
})

const Message = ({reminder=log, children}) => {
  const [messages, setMessages] = useState([]);

  console.log(`caused by Message context re-rendering`);

  useEffect(() => {
    sock.on('message', ({message, from}) => {
      setMessages([...messages, {message, from}])
    })
    return () => {
      sock.off('message');
    }
  }, [messages])

  const say = useCallback((message, from) => {
    sock.emit('message', {message, from}, []);
  } )

  return <MessageContext.Provider value={{messages, say}}>
    {children}
  </MessageContext.Provider>
}

const LoginContext = createContext({
  user: '',
  logged: false,
  login: () => {}
})

const Login = ({reminder=log, children}) => {

  console.log(`caused by Login context re-rendering`);

  const [user, setUser] = useState(sessionStorage.getItem('user'));
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    sock.on('login', ({ok, user, error}) => {
      reminder({ok, error});
      if (ok){
        if (ok === 'NEW'){
          sessionStorage.setItem('user', user);
        }
        setUser(user);
        setLogged(true);
      }
      if (error){
        if (error === 'EXPIRED'){
          sessionStorage.removeItem('user');
          setUser(null);
        }
      }
    });

    return () => {
      sock.off('login');
    }
  }, [])

  const login = useCallback((user, local=false) => {
    console.log(`login called from ${local ? 'inside' : 'outside'}`);
    sock.emit('login', {user, local}, [])
  })

  useEffect(() => {
    console.log(logged, user);
    if((!logged) && (user !== null)){
      login(user, true);
    }
  }, [])

  return <LoginContext.Provider value={{user, logged, login}}>
    {children}
  </LoginContext.Provider>
}

const Content = () => {

  const {messages} = useContext(MessageContext);

  return <div className='content'>
    {messages.map(({message, from}, i) => <div key={i} className='message'>
      <div className='message-sender'>{from}</div>
      <div className='message-content'>{message}</div>
    </div>)}
  </div>
}

const InputBar = () => {

  const [inputVal, setInputVal] = useState('');

  const {say} = useContext(MessageContext);
  const {login, logged, user} = useContext(LoginContext);

  const send = (value, user) => {
    logged ? say(value, user) : login(value);
  }

  return <div className='input-bar'>
    <InputGroup size="sm">
      <Input
        type="text"
        placeholder={logged ? `Yo ${user}, say somethin. Type '@' to mention another friend` : `Type a nickname to login.`}
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyUp={(e) => {
          if (e.key === "Enter"){
            send(inputVal, user);
            setInputVal('');
          }
        }}
      />
      <InputGroupAddon addonType="append">
        <Button
          onClick={() => {
            send(inputVal, user)
            setInputVal('');
          }}
          color={logged ? 'warning' : 'info'}
        >{logged ? '说' : '登录'}</Button>
      </InputGroupAddon>
    </InputGroup>
  </div>

}

const App = () => {

  // sessionStorage.setItem('user', 'marvin');

  // const {alert, reminder} = useAlert();
  // const {user, logged, login} = useLogin();
  // const {messages, say} = useMessage();

  return <div className="App">
    <Login>
      <Message>
        <Content />
        <InputBar />
      </Message>
    </Login>
  </div>
}

export default App;
