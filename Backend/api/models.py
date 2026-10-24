from django.db import models


class Chambre(models.Model):

    TYPE_CHOICES = [
        ('simple', 'Simple'),
        ('double', 'Double'),
        ('triple', 'Triple'),
        ('suite', 'Suite'),
    ]

    STATUT_CHOICES = [
        ('disponible', 'Disponible'),
        ('occupee', 'Occupée'),
        ('maintenance', 'Maintenance'),
    ]

    numero = models.CharField(max_length=10, unique=True)

    type_chambre = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES
    )

    prix = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    capacite = models.PositiveIntegerField()

    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='disponible'
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    def __str__(self):
        return f"Chambre {self.numero}"


class Client(models.Model):

    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    telephone = models.CharField(max_length=20)
    adresse = models.CharField(max_length=255, blank=True)

    date_naissance = models.DateField(
        null=True,
        blank=True
    )

    date_creation = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.prenom} {self.nom}"

class Reservation(models.Model):

    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('confirmee', 'Confirmée'),
        ('annulee', 'Annulée'),
        ('terminee', 'Terminée'),
    ]

    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='reservations'
    )

    chambre = models.ForeignKey(
        Chambre,
        on_delete=models.CASCADE,
        related_name='reservations'
    )

    date_arrivee = models.DateField()
    date_depart = models.DateField()

    nombre_nuits = models.PositiveIntegerField(
        default=0,
        editable=False
    )

    prix_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        editable=False
    )

    nombre_personnes = models.PositiveIntegerField(
        default=1
    )

    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='en_attente'
    )

    remarque = models.TextField(
        blank=True,
        null=True
    )

    date_reservation = models.DateTimeField(
        auto_now_add=True
    )

    def save(self, *args, **kwargs):

        if self.date_arrivee and self.date_depart:

            self.nombre_nuits = (
                self.date_depart - self.date_arrivee
            ).days

        if self.chambre and self.nombre_nuits > 0:

            self.prix_total = (
                self.chambre.prix * self.nombre_nuits
            )

        else:
            self.prix_total = 0

        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.client} - "
            f"Chambre {self.chambre.numero}"
        )
class Paiement(models.Model):

    MODE_CHOICES = [
        ('especes', 'Espèces'),
        ('carte', 'Carte bancaire'),
        ('mobile_money', 'Mobile Money'),
        ('virement', 'Virement bancaire'),
    ]

    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('paye', 'Payé'),
        ('rembourse', 'Remboursé'),
        ('annule', 'Annulé'),
    ]

    reservation = models.ForeignKey(
        Reservation,
        on_delete=models.CASCADE,
        related_name='paiements'
    )

    montant = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    mode_paiement = models.CharField(
        max_length=30,
        choices=MODE_CHOICES
    )

    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='en_attente'
    )

    date_paiement = models.DateTimeField(
        auto_now_add=True
    )

    reference = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    remarque = models.TextField(
        blank=True,
        null=True
    )

    def __str__(self):
        return f"Paiement {self.montant} Ar - {self.reservation}"