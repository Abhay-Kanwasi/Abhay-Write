import { useState } from 'react';
import axios from 'axios';
import { Box, Grid, TextField, Button, InputAdornment, Card, CardContent, Typography } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import { getBaseURL } from '../../helpers/axios';
import { CARD_BUTTON, CARD_HEADING } from '../../constants/CardMessages';
import { CARD_SUBHEADING } from '../../constants/CardMessages';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    const data = {
      email: email
    };
    axios
      .post(`${getBaseURL()}/api/forgotPassword/`, data)
      .then(() => {
        setSuccess('Email sent successfully!');
        setError('');
      })
      .catch((err) => {
        if (err.response) {
          setError(err.response.data.message || 'Something went wrong!');
          setSuccess('');
        }
      });
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid item lg={3} md={6} xs={10}>
          <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
            <CardContent>
              <Typography variant="h5" align="center" gutterBottom>
                {CARD_HEADING.FORGOT_PASSWORD}
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary" gutterBottom>
                {CARD_SUBHEADING.FORGOT_PASSWORD_SUBHEADING}
              </Typography>
              <TextField
                label="Email"
                required
                variant="outlined"
                fullWidth
                margin="normal"
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
              {error && (
                <Typography variant="body2" color="error" align="center" gutterBottom>
                  {error}
                </Typography>
              )}
              {success && (
                <Typography variant="body2" color="success" align="center" gutterBottom>
                  {success}
                </Typography>
              )}
            <div style={{ textAlign: 'center' }}>
                <Button
                    onClick={handleSubmit}
                    variant='contained'
                    color='info'
                    style={{ width: '80%', marginBottom: '1rem' }}
                    sx={{
                        '&:hover': {
                            backgroundColor: '#0E4491',
                            color: 'white',
                        },
                    }}
                >
                    {CARD_BUTTON.LOGIN}
                </Button>
            </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ForgotPassword;
