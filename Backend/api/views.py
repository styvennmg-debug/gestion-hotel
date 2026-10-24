from django.contrib.auth import authenticate

from rest_framework import viewsets, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Chambre, Client, Reservation, Paiement

from .serializers import (
    ChambreSerializer,
    ClientSerializer,
    ReservationSerializer,
    PaiementSerializer
)


# =========================================================
# AUTHENTIFICATION
# =========================================================

class LoginView(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request):

        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {
                    "success": False,
                    "message": "Nom d'utilisateur et mot de passe requis."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(
            username=username,
            password=password
        )

        if user is None:
            return Response(
                {
                    "success": False,
                    "message": "Nom d'utilisateur ou mot de passe incorrect."
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        token, created = Token.objects.get_or_create(
            user=user
        )

        return Response(
            {
                "success": True,
                "message": "Connexion réussie.",
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser
                }
            },
            status=status.HTTP_200_OK
        )


# =========================================================
# CHAMBRES
# =========================================================

class ChambreViewSet(viewsets.ModelViewSet):

    queryset = Chambre.objects.all()
    serializer_class = ChambreSerializer


# =========================================================
# CLIENTS
# =========================================================

class ClientViewSet(viewsets.ModelViewSet):

    queryset = Client.objects.all()
    serializer_class = ClientSerializer


# =========================================================
# RESERVATIONS
# =========================================================

class ReservationViewSet(viewsets.ModelViewSet):

    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer

    def create(self, request, *args, **kwargs):

        client_id = request.data.get("client")
        chambre_id = request.data.get("chambre")
        date_arrivee = request.data.get("date_arrivee")
        date_depart = request.data.get("date_depart")
        nombre_personnes = request.data.get("nombre_personnes")

        # Vérification des champs obligatoires
        if not client_id or not chambre_id:
            return Response(
                {
                    "detail": "Le client et la chambre sont obligatoires."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not date_arrivee or not date_depart:
            return Response(
                {
                    "detail": "Les dates d'arrivée et de départ sont obligatoires."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier que le nombre de personnes est valide
        try:
            nombre_personnes = int(nombre_personnes)
        except (TypeError, ValueError):
            return Response(
                {
                    "detail": "Le nombre de personnes doit être un nombre valide."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if nombre_personnes <= 0:
            return Response(
                {
                    "detail": "Le nombre de personnes doit être supérieur à 0."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Récupérer le client
        try:
            client = Client.objects.get(id=client_id)
        except Client.DoesNotExist:
            return Response(
                {
                    "detail": "Le client sélectionné n'existe pas."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Récupérer la chambre
        try:
            chambre = Chambre.objects.get(id=chambre_id)
        except Chambre.DoesNotExist:
            return Response(
                {
                    "detail": "La chambre sélectionnée n'existe pas."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier les dates
        from datetime import datetime

        try:
            arrivee = datetime.strptime(
                date_arrivee,
                "%Y-%m-%d"
            ).date()

            depart = datetime.strptime(
                date_depart,
                "%Y-%m-%d"
            ).date()

        except ValueError:
            return Response(
                {
                    "detail": "Format de date invalide."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if arrivee >= depart:
            return Response(
                {
                    "detail": "La date de départ doit être après la date d'arrivée."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier la capacité de la chambre
        if nombre_personnes > chambre.capacite:
            return Response(
                {
                    "detail": (
                        f"Cette chambre peut accueillir "
                        f"au maximum {chambre.capacite} personne(s)."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier si la chambre est en maintenance
        if chambre.statut == "maintenance":
            return Response(
                {
                    "detail": "Cette chambre est actuellement en maintenance."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier les réservations qui se chevauchent
        reservations_existantes = Reservation.objects.filter(
            chambre=chambre
        ).exclude(
            statut="annulee"
        ).filter(
            date_arrivee__lt=depart,
            date_depart__gt=arrivee
        )

        if reservations_existantes.exists():

            return Response(
                {
                    "detail": (
                        f"La chambre {chambre.numero} "
                        f"est déjà réservée pour cette période."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Toutes les vérifications sont bonnes
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        self.perform_create(serializer)

        headers = self.get_success_headers(
            serializer.data
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

# =========================================================
# PAIEMENTS
# =========================================================

class PaiementViewSet(viewsets.ModelViewSet):

    queryset = Paiement.objects.all()
    serializer_class = PaiementSerializer