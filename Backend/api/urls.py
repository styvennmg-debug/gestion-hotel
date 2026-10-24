from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    LoginView,
    ChambreViewSet,
    ClientViewSet,
    ReservationViewSet,
    PaiementViewSet
)


router = DefaultRouter()

router.register(
    r'chambres',
    ChambreViewSet,
    basename='chambre'
)

router.register(
    r'clients',
    ClientViewSet,
    basename='client'
)

router.register(
    r'reservations',
    ReservationViewSet,
    basename='reservation'
)

router.register(
    r'paiements',
    PaiementViewSet,
    basename='paiement'
)


urlpatterns = [

    # Authentification
    path(
        'login/',
        LoginView.as_view(),
        name='login'
    ),

    # API CRUD
    path(
        '',
        include(router.urls)
    ),
]