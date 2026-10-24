
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    LoginView,
    LogoutView,
    ChambreViewSet,
    ClientViewSet,
    ReservationViewSet,
    PaiementViewSet,
    csrf_token_view,
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
    # Connexion
    path(
        'login/',
        LoginView.as_view(),
        name='login'
    ),

    # Déconnexion
    path(
        'logout/',
        LogoutView.as_view(),
        name='logout'
    ),

    # Cookie CSRF
    path(
        'csrf/',
        csrf_token_view,
        name='csrf-token'
    ),

    # API CRUD
    path(
        '',
        include(router.urls)
    ),
]
