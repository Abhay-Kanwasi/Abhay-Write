# django modules
from django.contrib.auth.models import User, Group
from django.http import JsonResponse
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.views.decorators.csrf import csrf_exempt

# rest framework modules
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response

# logging initialization 
import logging
logger = logging.getLogger(__name__)

# user modules
from .serializers import GallerySerializer
from .models import Gallery


@csrf_exempt
@api_view(['POST'])
def add_to_gallery(request):
    if request.method == 'POST':
        try:
            logger.info(f"request data {request.data}")
            data = request.data
            title = data['title']
            description = data['description']
            created_by = data['created_by']
            genere = data['genere']
            language = data['language']
            year = data['year']
            image = request.FILES['image']
            
            # Validate choices
            if genere not in dict(Gallery.GENERE_CHOICES):
                return JsonResponse({'error': 'Invalid genere choice'}, status=400)
            if language not in dict(Gallery.LANGUAGE_CHOICES):
                return JsonResponse({'error': 'Invalid language choice'}, status=400)
            if int(year) not in dict(Gallery.YEAR_CHOICES).keys():
                return JsonResponse({'error': 'Invalid year choice'}, status=400)
            
            add = Gallery.objects.create(
                title=title,
                description=description,
                created_by=created_by,
                genere=genere,
                language=language,
                year=year,
                image=image
            )
            add.save()
            return JsonResponse({'data': 'Added to gallery'}, status=200)
        except Exception as error:
            logger.error(f"Error occurred: {error}")
            return JsonResponse({'error': str(error)}, status=500)
    else:
        return JsonResponse({'error': 'Incorrect method'}, status=405)

@csrf_exempt
@api_view(['GET'])
def get_gallery_images(request):
    if request.method == 'GET':
        try:
            gallery_data = Gallery.objects.all()
            serializer = GallerySerializer(gallery_data, many=True)
            return JsonResponse(serializer.data, safe=False)
        except Exception as error:
            logger.error("Exception during getting all gallery images", error)
            return JsonResponse({'error': str(error)}, status=500)

@csrf_exempt
@api_view(['GET'])
def gallery_options(request):
    try:
        if request.method == 'GET':
            genere_choices = dict(Gallery.GENERE_CHOICES).keys()
            language_choices = dict(Gallery.LANGUAGE_CHOICES).keys()
            year_choices = dict(Gallery.YEAR_CHOICES).keys()
            
            gallery_options = {
                "genere_choices": list(genere_choices),
                "language_choices": list(language_choices),
                "year_choices": list(year_choices)
            }
                
            return JsonResponse(gallery_options, status=200)
        else:
            return JsonResponse({'error': 'Incorrect method'}, status=405)
    except Exception as error:
        logger.error("Exception during getting all gallery options", error)
        return JsonResponse({'error': str(error)}, status=500)