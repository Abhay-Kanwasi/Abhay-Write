import os
import glob
import zipfile
import mimetypes
import json
from datetime import datetime

from django.http import FileResponse 
from django.http import HttpResponse
from django.core.exceptions import ValidationError
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings

from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

# logger configuration
import logging
logger = logging.getLogger(__name__)

# user defined imports
from ..models import Logging
from ..serializers.loggingSerializer import LoggingSerializer


@api_view(['POST', 'GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def loggingApi(request, id=0):
    if request.method == 'GET':
        date = request.GET.get('filterdate')
        if date is not None:
            try:
                logger.debug(f"Get the filtered logs according to {date} request")
                pages = int(request.GET.get('pages'))
                logs_per_page = 100
                page_number = pages
                start_index = (page_number - 1) * logs_per_page
                end_index = start_index + logs_per_page
                logger.debug(f"Date: {date}, Page number: {page_number}")
                frontend_date = datetime.strptime(date, '%Y-%m-%d').date()
                filtered_loggings = Logging.objects.filter(LogDetails__startswith=frontend_date.strftime('%a, %b %d, %Y'))[start_index:end_index]

                if not filtered_loggings:
                    logger.debug("No filtered logs available")
                    return JsonResponse({'logs': [], 'metadata': {'current_page': page_number, 'total_pages': 1, 'has_next_page': False}}, safe=False)
                
                loggings_serializer = LoggingSerializer(filtered_loggings, many=True)

                total_logs_count = Logging.objects.filter(LogDetails__startswith=frontend_date.strftime('%a, %b %d, %Y')).count()
                total_pages = (total_logs_count + logs_per_page - 1) // logs_per_page
                has_next_page = end_index < total_logs_count

                logger.debug(f"total logs count is {total_logs_count}, total_pages is {total_pages}")
                metadata = {
                    'current_page': page_number,
                    'total_pages': total_pages,
                    'has_next_page': has_next_page,
                }
                return JsonResponse({"filtered_loggings": loggings_serializer.data, 'metadata': metadata}, safe=False)
            except Exception as error:
                print("Error during logging", error)
        else:
            logger.debug(f"Get the logs according to request")
            logs_per_page = 100
            page_number = int(request.GET.get('page', 1))
            start_index = (page_number - 1) * logs_per_page
            end_index = start_index + logs_per_page
            all_logs = Logging.objects.all().order_by('-LoggingID')[start_index:end_index]
            if not all_logs:
                logger.debug("No filtered logs available")
                return JsonResponse({'logs': [], 'metadata': {'current_page': page_number, 'total_pages': 1, 'has_next_page': False}}, safe=False)
            
            logs_serializer = LoggingSerializer(all_logs, many=True)
            total_logs_count = Logging.objects.count()
            total_pages = (total_logs_count + logs_per_page - 1) // logs_per_page
            has_next_page = end_index < total_logs_count

            logger.debug(f"total logs count is {total_logs_count}, total_pages is {total_pages}")
            metadata = {
                'current_page': page_number,
                'total_pages': total_pages,
                'has_next_page': has_next_page,
            }
            return JsonResponse({'logs': logs_serializer.data, 'metadata': metadata}, safe=False)
    elif request.method == 'POST':
        try:
            logging_data = JSONParser().parse(request)
            loggings_serializer = LoggingSerializer(data=logging_data)
            if loggings_serializer.is_valid():
                loggings_serializer.save()
                return JsonResponse("Added Successfully", safe=False)
            return JsonResponse({"error": str(e)}, safe=False)
        except Exception as e:
            logger.exception("Failed to add", stack_info=True)
            return JsonResponse("Failed to add", safe=False)
    elif request.method == 'PUT':
        logging_data = JSONParser().parse(request)
        for data in logging_data:
            logg = Logging.objects.get(LoggingID=data['LoggingID'])
            loggings_serializer = LoggingSerializer(
                logg, data=data, partial=True)
            if loggings_serializer.is_valid():
                loggings_serializer.save()
            else:
                return JsonResponse(loggings_serializer.errors, status=400)
        return JsonResponse("Updated Successfully", safe=False)
    elif request.method == 'DELETE':
        logg = Logging.objects.get(LoggingID=id)
        logg.delete()
        return JsonResponse("Deleted Successfully", safe=False)
    

@api_view(['POST', 'GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def loggingDownload(request, id=0):
    if request.method == 'GET':
        loggings = Logging.objects.all()
        loggings_serializer = LoggingSerializer(
            loggings, many=True)
        return JsonResponse(loggings_serializer.data, safe=False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def download_logs(request):
    log_folder_path = settings.LOGGING_DIR
    log_files = glob.glob(os.path.join(log_folder_path, '*.log*'))
    zip_filename = 'log_files.zip'
    with zipfile.ZipFile(zip_filename, 'w') as zip_file:
        for log_file in log_files:
            zip_file.write(log_file, os.path.basename(log_file))
    response = FileResponse(open(zip_filename, 'rb'))
    content_type, encoding = mimetypes.guess_type(zip_filename)
    response = HttpResponse(open(zip_filename, 'rb').read(), content_type='application/zip')
    response['Content-Disposition'] = f'attachment; filename="{zip_filename}"'
    os.remove(zip_filename)
    return response