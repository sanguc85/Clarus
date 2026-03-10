import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AzureOidcCoreService } from 'src/app/azure-oidc/azure-oidc-core.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  @Output() toggleErrorTrayEvent = new EventEmitter<void>();
  title!: string;
  public username: string;
  constructor(private route: ActivatedRoute, private router: Router,
    private titleService: Title,private authService: AzureOidcCoreService) {
  }


  ngOnInit(): void {
    // Listen for route changes
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Get the title and Path from the current route's data or set default values
        this.title = this.getTitleFromRouteData(this.route);
        // Set the title in the browser's title bar
        this.titleService.setTitle(this.title);
      }
    });
    this.authService.userNameCallBack$.subscribe((name: string) => {
      this.username = name;
    });
  }
  
  toggleErrorTray(): void {
    this.toggleErrorTrayEvent.emit();
  }

  private getTitleFromRouteData(route: ActivatedRoute): string {
    // Traverse the route tree to find the data property
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.snapshot.data['title'] || 'Clarus';
  }
}
