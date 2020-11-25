import { Component, OnInit, Input } from '@angular/core';
import { MatSnackBar, MatSnackBarDismiss } from '@angular/material/snack-bar';
import { AdminService } from '../admin.service';
import { TableResponse } from '../../../interfaces/table.interface';
import { Section } from 'src/app/interfaces/section.interface';
import { ScoreItem, ScoreItemResponse, ScoreItemsResponse } from '../../../interfaces/score.interface';
import { Subscription } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.css']
})
export class PollComponent implements OnInit {
  @Input() nomargin: boolean;
  @Input() nopadding: boolean;
  
  userSubscription: Subscription;
  sectionSelected: Section;
  scoreItems: ScoreItem[] = [];
  scoreItemsSection: ScoreItem[] = [];

  newItem: ScoreItem;
  constructor(
    public adminService: AdminService,
    public loginService: LoginService,
    private snack: MatSnackBar

  ) { }

  ngOnInit(): void {
    let idCompany = this.loginService.user.id_company._id;
    this.readScoreItems(idCompany);
  }


  readScoreItems = (idCompany: string): void => {
    this.adminService.readScoreItems(idCompany).subscribe((data: ScoreItemsResponse) => {
      this.scoreItems = data.scoreitems;
      this.scoreItemsSection = data.scoreitems;
    })
  }


  deleteScoreItem(idScoreItem: string): void {
    this.snack.open('Desea eliminar este item?', 'ELIMINAR', { duration: 5000 }).afterDismissed().subscribe((data: MatSnackBarDismiss) => {
      if (data.dismissedByAction) {
        this.adminService.deleteScoreItem(idScoreItem).subscribe((data: ScoreItemResponse) => {
          this.snack.open(data.msg, null, { duration: 5000 });
          this.scoreItems = this.scoreItems.filter(item => item._id != idScoreItem);
          this.scoreItemsSection = this.scoreItemsSection.filter(table => table._id != idScoreItem);
        },
          (err: TableResponse) => {
            this.snack.open(err.msg, null, { duration: 5000 });
          }
        )
      }
    });
  }

  sectionChanged(section: Section): void {
    this.sectionSelected = section;
    this.scoreItemsSection = this.scoreItems.filter(table => table.id_section === section._id)
  }

  scoreItemCreated(scoreItem: ScoreItem): void {
    this.newItem = scoreItem;
    this.scoreItems.push(scoreItem);
    this.scoreItemsSection.push(scoreItem);

  }
}
