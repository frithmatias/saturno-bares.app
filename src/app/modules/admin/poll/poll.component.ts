import { Component, OnInit, Input } from '@angular/core';
import { AdminService } from '../admin.service';
import { TableResponse } from '../../../interfaces/table.interface';
import { Section } from 'src/app/interfaces/section.interface';
import { ScoreItem, ScoreItemResponse, ScoreItemsResponse } from '../../../interfaces/score.interface';
import { Subscription } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.css']
})
export class PollComponent implements OnInit {
  @Input() nomargin: boolean;
  @Input() nopadding: boolean;

  displayedColumns: string[] = ['id_section','tx_item', '_id'];

  scoreItemCreate = false;
  sectionSelected: Section;
  scoreItems: ScoreItem[] = [];
  scoreItemsSection: ScoreItem[] = [];

  newItem: ScoreItem;
  constructor(
    public adminService: AdminService,
    public loginService: LoginService,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    let idCompany = this.loginService.user.id_company?._id;
    if (idCompany) { this.readScoreItems(idCompany); }
  }


  readScoreItems = (idCompany: string): void => {
    this.adminService.readScoreItems(idCompany).subscribe((data: ScoreItemsResponse) => {
      this.scoreItems = data.scoreitems;
      this.scoreItemsSection = data.scoreitems;
    })
  }


  deleteScoreItem(item: ScoreItem): void {
    this.sharedService.snack(`Desea eliminar el item ${item.tx_item} para calificar?`, 3000, 'Aceptar').then(ok => {
      if(ok){

        let idScoreItem = item._id;
        this.adminService.deleteScoreItem(idScoreItem).subscribe((data: ScoreItemResponse) => {
          this.sharedService.snack(data.msg, 1000);
          this.scoreItems = this.scoreItems.filter(item => item._id != idScoreItem);
          this.scoreItemsSection = this.scoreItemsSection.filter(table => table._id != idScoreItem);
        },
          (err: TableResponse) => {
            this.sharedService.snack(err.msg, 3000);
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
    this.scoreItems = [...this.scoreItems, scoreItem];
    this.scoreItemsSection = [...this.scoreItemsSection, scoreItem];
  }
}
