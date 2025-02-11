import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { firstValueFrom, Subject } from "rxjs";

import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { TreeNode } from "@bitwarden/common/vault/models/domain/tree-node";

import { VaultFilterComponent as BaseVaultFilterComponent } from "../../individual-vault/vault-filter/components/vault-filter.component"; //../../vault/vault-filter/components/vault-filter.component";
import { VaultFilterService } from "../../individual-vault/vault-filter/services/abstractions/vault-filter.service";
import {
  VaultFilterList,
  VaultFilterType,
  VaultFilterSection,
} from "../../individual-vault/vault-filter/shared/models/vault-filter-section.type";
import { CollectionFilter } from "../../individual-vault/vault-filter/shared/models/vault-filter.type";

@Component({
  selector: "app-organization-vault-filter",
  templateUrl: "../../individual-vault/vault-filter/components/vault-filter.component.html",
})
export class VaultFilterComponent extends BaseVaultFilterComponent implements OnInit, OnDestroy {
  @Input() set organization(value: Organization) {
    if (value && value !== this._organization) {
      this._organization = value;
      this.vaultFilterService.setOrganizationFilter(this._organization);
    }
  }
  _organization: Organization;
  protected destroy$: Subject<void>;

  private flexibleCollectionsEnabled: boolean;

  constructor(
    protected vaultFilterService: VaultFilterService,
    protected policyService: PolicyService,
    protected i18nService: I18nService,
    protected platformUtilsService: PlatformUtilsService,
    protected configService: ConfigServiceAbstraction,
  ) {
    super(vaultFilterService, policyService, i18nService, platformUtilsService);
  }

  async ngOnInit() {
    this.flexibleCollectionsEnabled = await this.configService.getFeatureFlag(
      FeatureFlag.FlexibleCollections,
    );
    this.filters = await this.buildAllFilters();
    if (!this.activeFilter.selectedCipherTypeNode) {
      this.activeFilter.resetFilter();
      this.activeFilter.selectedCollectionNode =
        (await this.getDefaultFilter()) as TreeNode<CollectionFilter>;
    }
    this.isLoaded = true;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async removeCollapsibleCollection() {
    const collapsedNodes = await firstValueFrom(this.vaultFilterService.collapsedFilterNodes$);

    collapsedNodes.delete("AllCollections");

    await this.vaultFilterService.setCollapsedFilterNodes(collapsedNodes);
  }

  protected async addCollectionFilter(): Promise<VaultFilterSection> {
    // Ensure the Collections filter is never collapsed for the org vault
    this.removeCollapsibleCollection();

    const collectionFilterSection: VaultFilterSection = {
      data$: this.vaultFilterService.buildTypeTree(
        {
          id: "AllCollections",
          name: "collections",
          type: "all",
          icon: "bwi-collection",
        },
        [
          {
            id: "AllCollections",
            name: "Collections",
            type: "all",
            icon: "bwi-collection",
          },
        ],
      ),
      header: {
        showHeader: false,
        isSelectable: true,
      },
      action: this.applyCollectionFilter,
    };
    return collectionFilterSection;
  }

  async buildAllFilters(): Promise<VaultFilterList> {
    const builderFilter = {} as VaultFilterList;
    builderFilter.typeFilter = await this.addTypeFilter(["favorites"]);
    if (this.flexibleCollectionsEnabled) {
      builderFilter.collectionFilter = await this.addCollectionFilter();
    } else {
      builderFilter.collectionFilter = await super.addCollectionFilter();
    }
    builderFilter.trashFilter = await this.addTrashFilter();
    return builderFilter;
  }

  async getDefaultFilter(): Promise<TreeNode<VaultFilterType>> {
    return await firstValueFrom(this.filters?.collectionFilter.data$);
  }
}
