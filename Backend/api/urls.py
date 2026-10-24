from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.db import connection
from django.http import JsonResponse


from .views import (
    LoginView,
    ChambreViewSet,
    ClientViewSet,
    ReservationViewSet,
    PaiementViewSet,
    verification_base
)


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

    # Vérification de la base de données
    path(
        'verification-base/',
        verification_base,
        name='verification_base'
    ),

    # API CRUD
    path(
        '',
        include(router.urls)
    ),
]