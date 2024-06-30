import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Grid, TextField, Button, Link, InputAdornment, Card, CardContent, Typography } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { getBaseURL } from '../../helpers/axios';
import { CARD_BUTTON, CARD_ERRORS } from '../../constants/CardMessages';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    let data ={
        email: email,
        password: password
    }
    console.log("data", data)
    axios
      .post(`${getBaseURL()}/api/login/`, data)
      .then((res) => {
        console.log("response", res)
        localStorage.setItem("auth", JSON.stringify({
            access: res.data.access,
            refresh: res.data.refresh,
            user: res.data.user,
        }));
        navigate("/");
      })
      .catch((err) => {
        console.log("error", err)
        if (err.message) {console.log(err.message)
            if(err.response.data && err.response.data.active_status === 'inactive') {
                if(err.response.data.otp) {
                    navigate(`/activate/${email}`);
                } else {
                    setError('Invalid credentials!')
                }
            }
          setError(err.request.response);
        }
      });
  }

  const handleSignup = () => {
    navigate("/register")
  };
  const handleForgotPassword = () => {
    navigate("/forgot-password")
  };

  return (
    <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '95vh' }}>
            <Grid container spacing={2} justifyContent="center">
                <Grid item lg={3} md={6} xs={10}>
                    <Card variant="outlined">
                        <CardContent>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                <div style={{ backgroundColor: 'rgba(65, 147, 169, 0.4)', padding: '0.5rem', borderRadius: '50%' }}>
                                    <img width="60" height="60" src="https://img.icons8.com/?size=100&id=kDoeg22e5jUY&format=png&color=000000" alt="user"/>
                                </div>
                            </div>
                            <TextField
                                label="Email"
                                required
                                variant="outlined"
                                style={{ width: '100%', marginBottom: '1rem' }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <TextField
                                label="Password"
                                type="password"
                                required
                                variant="outlined"
                                style={{ width: '100%', marginBottom: '1rem' }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            {error &&
                                <Typography variant="body2" color="error" align="center" style={{ marginBottom: '1rem' }}>
                                    {CARD_ERRORS.INVALID_ERROR}
                                </Typography>
                            }

                            <div style={{ textAlign: 'center' }}>
                                <Button
                                    onClick={handleSubmit}
                                    variant='contained'
                                    style={{ width: '80%', marginBottom: '1rem' }}
                                    sx={{
                                        backgroundColor:'#4465B7',
                                        '&:hover': {
                                            backgroundColor: '#0E4491',
                                            color: 'white',
                                        },
                                    }}
                                >
                                    {CARD_BUTTON.LOGIN}
                                </Button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
                                <Link onClick={handleForgotPassword} style={{ cursor: 'pointer', paddingRight: '10px' }}>Forgot password?</Link>
                                <span>|</span>
                                <Link onClick={handleSignup} style={{ cursor: 'pointer', paddingLeft: '10px' }}>Register</Link>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
  )
}

export default Login;