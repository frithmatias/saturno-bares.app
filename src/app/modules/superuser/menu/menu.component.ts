import { Component, OnInit } from '@angular/core';
import { SuperuserService } from '../superuser.service';
import { MenuResponse, MenusResponse, MenuItem } from '../superuser.interface';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  
  allItems: MenuItem[] = [];
  menuItems: MenuItem[] = [];
  submenuItems: MenuItem[];

  itemEdit: MenuItem;
  ItemUpdated: MenuItem;

  idMenuSelected: string; // le paso al hijo el id del menu seleccionado (id_parent) 
  constructor(
    private superuserService: SuperuserService,
    private sharedService: SharedService
    ) { }

  ngOnInit(): void {
    this.readMenus();
  }

  editMenuItem(menu: MenuItem): void {
    this.itemEdit = menu;
  }

  // menu was created or updated
  menuItemUpdated(itemUpdated: MenuItem): void {
    let i = this.submenuItems.findIndex(item => item._id === itemUpdated._id)
    if(i>0){ 
      this.submenuItems[i] = itemUpdated;
    } else {
      // si findIndex responde -1, el item no esta en la lista, 
      // significa que no se trata de una edicion sino que se creo uno nuevo
      this.submenuItems.push(itemUpdated);
    }
  }

  readMenus(): void {
    this.superuserService.readMenus().subscribe((data: MenusResponse) => {
      this.allItems = data.menuitem;
      this.menuItems = data.menuitem.filter(item => item.id_parent === null);
    })
  }
  
  deleteMenuItem(idMenuItem: string): void {
    this.sharedService.snackShow('Desea eliminar el menu?', 5000, 'ELIMINAR').then((ok: boolean) => {
      if (ok) {
        this.superuserService.deleteMenu(idMenuItem).subscribe((data: MenuResponse) => {
          this.sharedService.snackShow(data.msg, 5000);
          this.submenuItems = this.submenuItems.filter(menu => menu._id != idMenuItem);
        },
          (err: MenuResponse) => {
            this.sharedService.snackShow(err.msg, 5000);
          }
        )
      }
    }).catch(()=>{})
  }


  getSubItems(id: string): void {
    this.idMenuSelected = id;
    this.submenuItems = this.allItems.filter(item => item.id_parent === id);
  }
}
