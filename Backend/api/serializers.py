from rest_framework import serializers
from .models import Chambre, Client, Reservation, Paiement


class ChambreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chambre
        fields = '__all__'


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'


class ReservationSerializer(serializers.ModelSerializer):

    client_nom = serializers.SerializerMethodField()

    chambre_numero = serializers.CharField(
        source='chambre.numero',
        read_only=True
    )

    class Meta:
        model = Reservation

        fields = '__all__'

        read_only_fields = [
            'nombre_nuits',
            'prix_total',
            'date_reservation',
        ]

    def get_client_nom(self, obj):
        return str(obj.client)

    class Meta:
        model = Reservation
        fields = '__all__'

    def get_client_nom(self, obj):
        return str(obj.client)


class PaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paiement
        fields = '__all__'