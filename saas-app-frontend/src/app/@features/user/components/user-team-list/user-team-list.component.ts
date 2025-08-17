import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'manager' | 'developer' | 'admin';
  status: 'active' | 'inactive';
  joinedDate: string;
}

@Component({
  selector: 'app-user-team-list',
  templateUrl: './user-team-list.component.html',
  styleUrls: ['./user-team-list.component.css'],
})
export class UserTeamListComponent implements OnInit {
  teamMembers: TeamMember[] = [
    {
      id: '1',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      role: 'manager',
      status: 'active',
      joinedDate: '2024-01-15',
    },
    {
      id: '2',
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie.martin@example.com',
      role: 'developer',
      status: 'active',
      joinedDate: '2024-02-20',
    },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  loadTeamMembers(): void {
    // TODO: Appeler le service pour charger les membres de l'équipe
  }

  createNewMember(): void {
    this.router.navigate(['/user/new']);
  }

  editMember(id: string): void {
    this.router.navigate(['/user/edit', id]);
  }

  deleteMember(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      // TODO: Appeler le service pour supprimer le membre
      console.log('Suppression du membre:', id);
    }
  }

  toggleMemberStatus(id: string): void {
    // TODO: Activer/désactiver le membre
    console.log('Changement du statut du membre:', id);
  }
}
