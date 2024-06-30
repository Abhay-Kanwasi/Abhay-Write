from django.db import models

class Gallery(models.Model):
    # Genre Choices
    ROMANTIC = 'Romantic'
    SAD = 'Sad'
    MOTIVATIONAL = 'Motivational'
    FUNNY = 'Funny'
    SELF_TALK = 'Self_talk'

    GENERE_CHOICES = [
        (SAD, 'Sad'),
        (FUNNY, 'Funny'),
        (SELF_TALK, 'Self-talk'),
        (ROMANTIC, 'Romantic'),
        (MOTIVATIONAL, 'Motivational'),
    ]

    # Language Choices
    HINDI = 'Hindi'
    ENGLISH = 'English'

    LANGUAGE_CHOICES = [
        (HINDI, 'Hindi'),
        (ENGLISH, 'English'),
    ]

    # Year Choices
    YEAR_CHOICES = [
        (2019, '2019'),
        (2020, '2020'),
        (2021, '2021'),
        (2022, '2022'),
        (2023, '2023'),
        (2024, '2024'),
        (2025, '2025'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(max_length=1000)
    image = models.ImageField(upload_to='images/', default=None)
    genere = models.CharField(
        max_length=20,
        choices=GENERE_CHOICES,
        default=ROMANTIC,
    )
    language = models.CharField(
        max_length=10,
        choices=LANGUAGE_CHOICES,
        default=ENGLISH,
    )
    year = models.IntegerField(
        choices=YEAR_CHOICES,
        default=2023,
    )
    created_by = models.CharField(max_length=25)
    uploaded_time = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.title
