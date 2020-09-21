import { Component, OnInit, OnDestroy, Input } from '@angular/core';

// libraries
import { MatSnackBar, MatSnackBarDismiss } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

// services
import { AdminService } from '../../../modules/admin/admin.service';
import { LoginService } from '../../../services/login.service';
import { SharedService } from '../../../services/shared.service';

// interfaces
import { User, UsersResponse, UserResponse } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-assistants',
  templateUrl: './assistants.component.html',
  styleUrls: ['./assistants.component.css']
})
export class AssistantsComponent implements OnInit, OnDestroy {
  @Input() nomargin: boolean;
  @Input() nopadding: boolean;
  assistants: User[];
  assistantEdit: User;
  idAssistantUpdated: string;
  user: User;
  userSubscription: Subscription;

  constructor(
    private adminService: AdminService,
    public loginService: LoginService,
    private sharedService: SharedService,
    private snack: MatSnackBar
  ) { }

  ngOnInit(): void {
    if (this.loginService.user) {
      
      this.user = this.loginService.user;
      
      if (this.user.id_company) {
        let idCompany = this.user.id_company._id;
        this.readAssistants(idCompany);
      }
      
      this.userSubscription = this.loginService.user$.subscribe(data => {
        if (data) {
          this.user = data;
          if (data.id_company) { this.readAssistants(data.id_company._id); }
        }
      })
    }
    
  }


  editAssistant(assistant: User): void {
    this.assistantEdit = assistant
  }

  // assistant was created or updated
  assistantUpdated(idAssistant: string): void {
    this.idAssistantUpdated = idAssistant;
    this.readAssistants(this.loginService.user.id_company._id);
  }

  readAssistants(idCompany: string): void {
    this.adminService.readAssistants(idCompany).subscribe((data: UsersResponse) => {
      this.assistants = data.users;
      this.adminService.assistants = data.users;
    });
  }

  deleteAssistant(idAssistant: string): void {
    if(idAssistant === this.loginService.user._id){
      this.sharedService.snackShow('Usted no puede borrar su propio usuario!', 2000);
      return;
    }
    this.snack.open('Desea eliminar el asistente?', 'ELIMINAR', { duration: 10000 }).afterDismissed().subscribe((data: MatSnackBarDismiss) => {
      if (data.dismissedByAction) {
        this.adminService.deleteAssistant(idAssistant).subscribe((data: UserResponse) => {
          this.snack.open(data.msg, null, { duration: 5000 });
          this.assistants = this.assistants.filter(assistant => assistant._id != idAssistant);
        },
          (err: UserResponse) => {
            this.snack.open(err.msg, null, { duration: 5000 });
          }
        )
      }
    })
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
