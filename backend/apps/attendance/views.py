from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.accounts.permissions import IsTenantUser
from .models import Shift, EmployeeShift, Attendance, AttendanceLog, WeekendPolicy
from .serializers import ShiftSerializer, EmployeeShiftSerializer, AttendanceSerializer, AttendanceLogSerializer, WeekendPolicySerializer, CheckInSerializer, CheckOutSerializer
from .services.attendance_service import AttendanceService
from apps.employees.permissions import EmployeeAccessPermission  # reuse

class ShiftViewSet(viewsets.ModelViewSet):
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantUser]  # Owner/HR can manage

class EmployeeShiftViewSet(viewsets.ModelViewSet):
    queryset = EmployeeShift.objects.all()
    serializer_class = EmployeeShiftSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantUser]

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantUser, EmployeeAccessPermission]

    def get_queryset(self):
        # Filter by tenant automatically via schema; but we can add employee filter if needed
        return super().get_queryset()

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsTenantUser])
    def check_in(self, request):
        serializer = CheckInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        employee = request.user.employee  # assuming user has employee profile
        if not employee:
            return Response({'error': 'No employee profile found for this user.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            attendance, log = AttendanceService.check_in(
                employee=employee,
                timestamp=timezone.now(),
                method='WEB',
                latitude=serializer.validated_data.get('latitude'),
                longitude=serializer.validated_data.get('longitude'),
                device=serializer.validated_data.get('device')
            )
            return Response({
                'message': 'Check-in successful',
                'attendance': AttendanceSerializer(attendance).data,
                'log': AttendanceLogSerializer(log).data
            })
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsTenantUser])
    def check_out(self, request):
        serializer = CheckOutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        employee = request.user.employee
        if not employee:
            return Response({'error': 'No employee profile found.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            attendance, log = AttendanceService.check_out(
                employee=employee,
                timestamp=timezone.now(),
                method='WEB',
                latitude=serializer.validated_data.get('latitude'),
                longitude=serializer.validated_data.get('longitude'),
                device=serializer.validated_data.get('device')
            )
            return Response({
                'message': 'Check-out successful',
                'attendance': AttendanceSerializer(attendance).data,
                'log': AttendanceLogSerializer(log).data
            })
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def today(self, request):
        employee = request.user.employee
        if not employee:
            return Response({'error': 'No employee profile found.'}, status=status.HTTP_400_BAD_REQUEST)
        today = timezone.now().date()
        attendance = Attendance.objects.filter(employee=employee, date=today).first()
        if attendance:
            serializer = AttendanceSerializer(attendance)
            return Response(serializer.data)
        return Response({'message': 'No attendance record for today.'}, status=status.HTTP_404_NOT_FOUND)

class AttendanceLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AttendanceLog.objects.all()
    serializer_class = AttendanceLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantUser]

class WeekendPolicyViewSet(viewsets.ModelViewSet):
    queryset = WeekendPolicy.objects.all()
    serializer_class = WeekendPolicySerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantUser]