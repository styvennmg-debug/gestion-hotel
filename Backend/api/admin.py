from django.contrib import admin
from .models import Chambre, Client, Reservation, Paiement

@admin.register(Chambre)
class ChambreAdmin(admin.ModelAdmin):
    list_display = (
        'numero',
        'type_chambre',
        'prix',
        'capacite',
        'statut',
    )

    list_filter = (
        'type_chambre',
        'statut',
    )

    search_fields = (
        'numero',
    )


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = (
        'nom',
        'prenom',
        'email',
        'telephone',
        'date_creation',
    )

    search_fields = (
        'nom',
        'prenom',
        'email',
        'telephone',
    )

    list_filter = (
        'date_creation',
    )


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = (
        'client',
        'chambre',
        'date_arrivee',
        'date_depart',
        'nombre_personnes',
        'statut',
        'date_reservation',
    )

    list_filter = (
        'statut',
        'date_arrivee',
        'date_depart',
    )

    search_fields = (
        'client__nom',
        'client__prenom',
        'client__email',
        'chambre__numero',
    )

    ordering = (
        '-date_reservation',
    )
@admin.register(Paiement)
class PaiementAdmin(admin.ModelAdmin):

    list_display = (
        'reservation',
        'montant',
        'mode_paiement',
        'statut',
        'date_paiement',
        'reference',
    )

    list_filter = (
        'mode_paiement',
        'statut',
        'date_paiement',
    )

    search_fields = (
        'reference',
        'reservation__client__nom',
        'reservation__client__prenom',
        'reservation__chambre__numero',
    )

    ordering = (
        '-date_paiement',
    )