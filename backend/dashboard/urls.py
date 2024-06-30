from django.urls import path
from .views import add_to_gallery, get_gallery_images, gallery_options

urlpatterns = [
    path('add_to_gallery/', add_to_gallery, name='add_to_gallery'),
    path('get_gallery_images/', get_gallery_images, name='get_gallery_images'),
    path('gallery_options/', gallery_options, name='gallery_options')
]