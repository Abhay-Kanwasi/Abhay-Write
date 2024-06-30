import datetime
import pytz
from account.serializers.loggingSerializer import LoggingSerializer
from django.utils import timezone
import logging
logger = logging.getLogger('__name__')


def logging_service(logLevel, logActivity, logData):
    try:
        current_datetime = timezone.now()
        logger.info(f"{current_datetime}")
        est_timezone = pytz.timezone('US/Eastern')
        formatted_datetime_est = current_datetime.astimezone(est_timezone)
        formatted_datetime = formatted_datetime_est.strftime("%a, %b %d, %Y, %I:%M:%S %p %Z")
        logger.info(f"{formatted_datetime}")
        logging_data = {
            'LogLevel': f"{logLevel}",
            'LogActivity': f"{logActivity}",
            'LogData':f"{logData}",
            'LogDetails':f"{formatted_datetime}"
        }
        loggings_serializer = LoggingSerializer(data=logging_data)
        if loggings_serializer.is_valid():
            loggings_serializer.save()
    except:
        logger.exception("Error while logging")