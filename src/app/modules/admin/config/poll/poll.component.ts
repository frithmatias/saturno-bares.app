import { Component, OnInit, Input } from '@angular/core';
import { AdminService } from 'src/app/modules/admin/admin.service';
import { TableResponse } from 'src/app/interfaces/table.interface';
import { Section } from 'src/app/interfaces/section.interface';
import { ScoreItem, ScoreItemResponse, ScoreItemsResponse } from 'src/app/interfaces/score.interface';
import { LoginService } from 'src/app/services/login.service';
import { PublicService } from 'src/app/modules/public/public.service';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.css']
})
export class PollComponent implements OnInit {
  @Input() nomargin: boolean;
  @Input() nopadding: boolean;

  displayedColumns: string[] = ['id_section', 'tx_item', '_id'];
  scoreItemCreate = false;
  sectionSelected: Section;
  newItem: ScoreItem;

  constructor(
    public adminService: AdminService,
    public loginService: LoginService,
    private publicService: PublicService
  ) { }

  ngOnInit(): void { }

  deleteScoreItem(item: ScoreItem): void {
    this.publicService.snack(`Desea eliminar el item ${item.tx_item} para calificar?`, 3000, 'Aceptar').then(() => {
      let idScoreItem = item._id;
      this.adminService.deleteScoreItem(idScoreItem).subscribe((data: ScoreItemResponse) => {
        this.publicService.snack(data.msg, 1000);
        this.adminService.scoreItems = this.adminService.scoreItems.filter(item => item._id != idScoreItem);
        this.adminService.scoreItemsSection = this.adminService.scoreItemsSection.filter(table => table._id != idScoreItem);
      },
        (err: TableResponse) => {
          this.publicService.snack(err.msg, 3000);
        }
      )

    });
  }

  sectionChanged(section: Section): void {
    this.sectionSelected = section;
    this.adminService.scoreItemsSection = this.adminService.scoreItems.filter(table => table.id_section === section._id)
  }

  scoreItemCreated(scoreItem: ScoreItem): void {
    this.newItem = scoreItem;
    this.adminService.scoreItems = [...this.adminService.scoreItems, scoreItem];
    this.adminService.scoreItemsSection = [...this.adminService.scoreItemsSection, scoreItem];
  }
}
