export class OnmsAssetFieldFormat {
  public label: string;
  public model: string;
  public type: string;
  public pattern?: string;
  public options?: string[];
}

export class OnmsAssetConfig {
  public title: string;
  public fields: OnmsAssetFieldFormat[];
}

export const OnmsAssetConfigGroups : OnmsAssetConfig[] =  [{
  title: 'Identification',
  fields: [
    {
      label: 'Description',
      model: 'description',
      type: 'text'
    },
    {
      label: 'Category',
      model: 'category',
      pattern: '^[A-Za-z0-9_-]*$',
      type: 'text'
    },
    {
      label: 'Manufacturer',
      model: 'manufacturer',
      type: 'text'
    },
    {
      label: 'Model Number',
      model: 'modelNumber',
      type: 'text'
    },
    {
      label: 'Serial Number',
      model: 'serialNumber',
      type: 'text'
    },
    {
      label: 'Asset Number',
      model: 'assetNumber',
      type: 'text'
    },
    {
      label: 'Date Installed',
      model: 'dateInstalled',
      type: 'date'
    },
    {
      label: 'Operating System',
      model: 'operatingSystem',
      type: 'text'
    }
  ]
}, {
  title: 'Configuration Categories',
  fields: [
    {
      label: 'Display Category',
      model: 'displayCategory',
      pattern: '^[A-Za-z0-9_-]*$',
      type: 'text'
    },
    {
      label: 'Notification Category',
      model: 'notifyCategory',
      pattern: '^[A-Za-z0-9_-]*$',
      type: 'text'
    },
    {
      label: 'Poller Category',
      model: 'pollerCategory',
      pattern: '^[A-Za-z0-9_-]*$',
      type: 'text'
    },
    {
      label: 'Threshold Category',
      model: 'thresholdCategory',
      pattern: '^[A-Za-z0-9_-]*$',
      type: 'text'
    }
  ]
}, {
  title: 'Location',
  fields: [
    {
      label: 'State',
      model: 'state',
      type: 'text'
    },
    {
      label: 'Region',
      model: 'region',
      type: 'text'
    },
    {
      label: 'Address 1',
      model: 'address1',
      type: 'text'
    },
    {
      label: 'Address 2',
      model: 'address2',
      type: 'text'
    },
    {
      label: 'City',
      model: 'city',
      type: 'text'
    },
    {
      label: 'ZIP',
      model: 'zip',
      type: 'text'
    },
    {
      label: 'Country',
      model: 'country',
      type: 'text'
    },
    {
      label: 'Longitude',
      model: 'longitude',
      pattern: '^[0-9.-]*$',
      type: 'text'
    },
    {
      label: 'Latitude',
      model: 'latitude',
      pattern: '^[0-9.-]*$',
      type: 'text'
    },
    {
      label: 'Division',
      model: 'division',
      type: 'text'
    },
    {
      label: 'Department',
      model: 'department',
      type: 'text'
    },
    {
      label: 'Building',
      model: 'building',
      type: 'text'
    },
    {
      label: 'Floor',
      model: 'floor',
      type: 'text'
    },
    {
      label: 'Room',
      model: 'room',
      type: 'text'
    },
    {
      label: 'Rack',
      model: 'rack',
      type: 'text'
    },
    {
      label: 'Rack unit height',
      model: 'rackunitheight',
      pattern: '^[0-9]*$',
      type: 'text'
    },
    {
      label: 'Slot',
      model: 'slot',
      type: 'text'
    },
    {
      label: 'Port',
      model: 'port',
      type: 'text'
    },
    {
      label: 'Circuit ID',
      model: 'circuitId',
      type: 'text'
    },
    {
      label: 'Admin',
      model: 'admin',
      type: 'text'
    }
  ]
}, {
  title: 'Hardware',
  fields: [
    {
      label: 'CPU',
      model: 'cpu',
      type: 'text'
    },
    {
      label: 'RAM',
      model: 'ram',
      type: 'text'
    },
    {
      label: 'Additional Hardware',
      model: 'additionalhardware',
      type: 'text'
    },
    {
      label: 'Number of Power Supplies',
      model: 'numpowersupplies',
      pattern: '^[0-9]*$',
      type: 'text'
    },
    {
      label: 'Input Power',
      model: 'inputpower',
      pattern: '^[0-9]*$',
      type: 'text'
    },
    {
      label: 'Storage Controller',
      model: 'storagectrl',
      type: 'text'
    },
    {
      label: 'HDD 1',
      model: 'hdd1',
      type: 'text'
    },
    {
      label: 'HDD 2',
      model: 'hdd2',
      type: 'text'
    },
    {
      label: 'HDD 3',
      model: 'hdd3',
      type: 'text'
    },
    {
      label: 'HDD 4',
      model: 'hdd4',
      type: 'text'
    },
    {
      label: 'HDD 5',
      model: 'hdd5',
      type: 'text'
    },
    {
      label: 'HDD 6',
      model: 'hdd6',
      type: 'text'
    }
  ]
}, {
  title: 'Authentication',
  fields: [
    {
      label: 'Username',
      model: 'username',
      type: 'text'
    },
    {
      label: 'Password',
      model: 'password',
      type: 'password'
    },
    {
      label: 'Enable Password',
      model: 'enable',
      type: 'password'
    },
    {
      label: 'Connection',
      model: 'connection',
      type: 'select',
      options: [ 'telnet', 'ssh', 'rsh', '' ]
    },
    {
      label: 'Auto Enable',
      model: 'autoenable',
      type: 'select',
      options: [ 'A', '' ]
    },
    {
      label: 'SNMP Community',
      model: 'snmpcommunity',
      type: 'text'
    }
  ]
}, {
  title: 'Vendor',
  fields: [
    {
      label: 'Name',
      model: 'vendor',
      type: 'text'
    },
    {
      label: 'Phone',
      model: 'vendorPhone',
      type: 'text'
    },
    {
      label: 'Fax',
      model: 'vendorFax',
      type: 'text'
    },
    {
      label: 'Lease',
      model: 'lease',
      type: 'text'
    },
    {
      label: 'Lease Expires',
      model: 'leaseExpires',
      type: 'date'
    },
    {
      label: 'Vendor Asset Number',
      model: 'vendorAssetNumber',
      type: 'text'
    },
    {
      label: 'Contract Number',
      model: 'maintcontract',
      type: 'text'
    },
    {
      label: 'Contract Expires',
      model: 'maintContractExpiration',
      type: 'date'
    },
    {
      label: 'Maint Phone',
      model:  'supportPhone',
      type: 'text'
    }
  ]
}, {
  title: 'VMWare',
  fields: [
    {
      label: 'VMware managed object ID',
      model: 'vmwareManagedObjectId',
      type: 'text'
    },
    {
      label: 'VMware managed entity type',
      model: 'vmwareManagedEntityType',
      type: 'text'
    },
    {
      label: 'VMware management server',
      model: 'vmwareManagementServer',
      type: 'text'
    },
    {
      label: 'VMware state',
      model: 'vmwareState',
      type: 'text'
    },
    {
      label: 'VMware Topology Info',
      model: 'vmwareTopologyInfo',
      type: 'textarea'
    }
  ]
}, {
  title: 'Comments',
  fields: [
    {
      label: 'Comment',
      model: 'comment',
      type: 'textarea'
    }
  ]
}];