import React, { useState, ChangeEvent, SyntheticEvent, useEffect } from "react";
import { TextField, Button, Box, Snackbar, Alert, Typography, MenuItem } from '@mui/material';
import axios from 'axios';
import { getBaseURL } from "../../helpers/axios";
import { CARD_ALERT, CARD_BUTTON, CARD_HEADING } from "../../constants/CardMessages";

interface AddProps {
    handleClose: () => void;
}

const Add: React.FC<AddProps> = ({ handleClose }) => {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [image, setImage] = useState<File | null>(null);
    const [genere, setGenere] = useState<string>("");
    const [language, setLanguage] = useState<string>("");
    const [year, setYear] = useState<string>("");
    const [genereOptions, setGenereOptions] = useState<string[]>([]);
    const [languageOptions, setLanguageOptions] = useState<string[]>([]);
    const [yearOptions, setYearOptions] = useState<string[]>([]);
    const [created_by, setCreatedBy] = useState<string>("");
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
    const [errorSnackbar, setErrorSnackbar] = useState<boolean>(false);

    const fetchOptions = async () => {
        try {
            const response = await axios.get(`${getBaseURL()}/dashboard/gallery_options/`);
            const { genere_choices, language_choices, year_choices } = response.data;
            setGenereOptions(genere_choices);
            setLanguageOptions(language_choices);
            setYearOptions(year_choices);
        } catch (error) {
            console.error("Error fetching options:", error);
        }
    };

    useEffect(() => {
        fetchOptions();
    }, []);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !image || !created_by || !genere || !language || !year) {
            setErrorSnackbar(true);
            return;
        }
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("image", image);
            formData.append("genere", genere);
            formData.append("language", language);
            formData.append("year", year);
            formData.append("created_by", created_by);
            console.log(formData)
            const response = await axios.post(`${getBaseURL()}/dashboard/add_to_gallery/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response.data);
            setOpenSnackbar(true);
            handleClose();
        } catch (error) {
            console.error("Error:", error);
            setErrorSnackbar(true);
        }
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImage(e.target.files[0]);
        }
    };

    const handleSnackbarClose = (_event: SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
        setErrorSnackbar(false);
    };

    return (
        <Box component="form" onSubmit={handleFormSubmit} sx={{ width: '100%', maxWidth: '900px', mx: 'auto' }}>
            <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                {CARD_HEADING.ADD_TO_GALLERY}
            </Typography>
            <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                fullWidth
                sx={{ mb: 2 }}
            />
            <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                multiline
                rows={4}
                fullWidth
                sx={{ mb: 2 }}
            />
             <TextField
                select
                label="Genere"
                value={genere}
                onChange={(e) => setGenere(e.target.value)}
                required
                fullWidth
                sx={{ mb: 2 }}
            >
                {genereOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
            </TextField>
            <TextField
                select
                label="Language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                required
                fullWidth
                sx={{ mb: 2 }}
            >
                {languageOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
            </TextField>
            <TextField
                select
                label="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                fullWidth
                sx={{ mb: 2 }}
            >
                {yearOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
            </TextField>
            <TextField
                type="file"
                onChange={handleImageChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
            />
            <TextField
                label="Created By"
                value={created_by}
                onChange={(e) => setCreatedBy(e.target.value)}
                required
                fullWidth
                sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button type="submit" variant="outlined" color="primary">
                    {CARD_BUTTON.SAVE}
                </Button>
                <Button variant="outlined" color="secondary" onClick={handleClose}>
                    {CARD_BUTTON.CANCEL}
                </Button>
            </Box>
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%', mb: 2 }}>
                    {CARD_ALERT.DETAILS_SAVED}
                </Alert>
            </Snackbar>
            <Snackbar open={errorSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%', mb: 2 }}>
                    {CARD_ALERT.FILL_ALL_FIELDS}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default Add;
