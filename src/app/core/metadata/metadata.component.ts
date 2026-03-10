import { Component, OnInit } from '@angular/core';
import { MetadataService } from './metadata.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss'],
})
export class MetadataComponent implements OnInit {
  userRole: string[] = [];
  constructor(public metaDataService: MetadataService, private router: Router) {}

  ngOnInit(): void {
    this.getUserRole();
    this.metaDataService.getUserRole().subscribe(() => {
      if (!this.metaDataService.isAdmin && !this.metaDataService.isMO) {
        this.router.navigateByUrl('/MetaData/Metadata');
      }
    });
  }

  getUserRole(): void {
    this.metaDataService.getUserRole().subscribe((data: any) => {
      this.userRole = data;
    });
  }
}
 